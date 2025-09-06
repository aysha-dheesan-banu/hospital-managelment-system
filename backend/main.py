from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from database import SessionLocal, engine, Base, Hospital, Role, User, Doctor
from typing import List, Optional
from pydantic import BaseModel
from passlib.context import CryptContext
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime

# Create all tables in the database
Base.metadata.create_all(bind=engine)

app = FastAPI()

# CORS middleware to allow requests from the frontend
origins = [
    "http://localhost:5173",  # React frontend
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Dependency to get the database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Pydantic models for request and response
class HospitalBase(BaseModel):
    name: str
    address: str

class HospitalCreate(HospitalBase):
    pass

class HospitalResponse(HospitalBase):
    id: int
    created_at: datetime
    class Config:
        orm_mode = True

class RoleBase(BaseModel):
    role_name: str
    permissions: str
    hospital_id: Optional[int] = None

class RoleCreate(RoleBase):
    pass

class RoleResponse(RoleBase):
    id: int
    hospital_name: Optional[str] = None
    class Config:
        orm_mode = True

class UserBase(BaseModel):
    username: str
    full_name: str
    email: str
    role_id: Optional[int] = None

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    role_name: Optional[str] = None
    class Config:
        orm_mode = True

class DoctorBase(BaseModel):
    user_id: int
    hospital_id: int
    specialty: str
    short_bio: Optional[str] = None

class DoctorCreate(DoctorBase):
    pass

class DoctorResponse(DoctorBase):
    id: int
    username: Optional[str] = None
    full_name: Optional[str] = None
    hospital_name: Optional[str] = None
    class Config:
        orm_mode = True

# Helper function to hash passwords
def get_password_hash(password):
    return pwd_context.hash(password)

# --- Hospital Endpoints ---
@app.post("/hospitals/", response_model=HospitalResponse, status_code=status.HTTP_201_CREATED)
async def create_hospital(hospital: HospitalCreate, db: Session = Depends(get_db)):
    db_hospital = db.query(Hospital).filter(Hospital.name == hospital.name).first()
    if db_hospital:
        raise HTTPException(status_code=400, detail="Hospital with this name already exists")
    db_hospital = Hospital(**hospital.dict())
    db.add(db_hospital)
    db.commit()
    db.refresh(db_hospital)
    return db_hospital

@app.get("/hospitals/", response_model=List[HospitalResponse])
async def read_hospitals(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    hospitals = db.query(Hospital).offset(skip).limit(limit).all()
    return hospitals

@app.get("/hospitals/{hospital_id}", response_model=HospitalResponse)
async def read_hospital(hospital_id: int, db: Session = Depends(get_db)):
    hospital = db.query(Hospital).filter(Hospital.id == hospital_id).first()
    if hospital is None:
        raise HTTPException(status_code=404, detail="Hospital not found")
    return hospital

@app.put("/hospitals/{hospital_id}", response_model=HospitalResponse)
async def update_hospital(hospital_id: int, hospital: HospitalCreate, db: Session = Depends(get_db)):
    db_hospital = db.query(Hospital).filter(Hospital.id == hospital_id).first()
    if db_hospital is None:
        raise HTTPException(status_code=404, detail="Hospital not found")
    
    # Check for duplicate name if name is being changed
    if hospital.name != db_hospital.name:
        existing_hospital = db.query(Hospital).filter(Hospital.name == hospital.name).first()
        if existing_hospital:
            raise HTTPException(status_code=400, detail="Hospital with this name already exists")

    for key, value in hospital.dict().items():
        setattr(db_hospital, key, value)
    db.commit()
    db.refresh(db_hospital)
    return db_hospital

@app.delete("/hospitals/{hospital_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_hospital(hospital_id: int, db: Session = Depends(get_db)):
    db_hospital = db.query(Hospital).filter(Hospital.id == hospital_id).first()
    if db_hospital is None:
        raise HTTPException(status_code=404, detail="Hospital not found")
    db.delete(db_hospital)
    db.commit()
    return {"message": "Hospital deleted successfully"}

# --- Role Endpoints ---
@app.post("/roles/", response_model=RoleResponse, status_code=status.HTTP_201_CREATED)
async def create_role(role: RoleCreate, db: Session = Depends(get_db)):
    if role.hospital_id:
        hospital = db.query(Hospital).filter(Hospital.id == role.hospital_id).first()
        if not hospital:
            raise HTTPException(status_code=404, detail="Hospital not found")
    
    db_role = Role(**role.dict())
    db.add(db_role)
    db.commit()
    db.refresh(db_role)
    
    # Populate hospital_name for response
    if db_role.hospital:
        db_role.hospital_name = db_role.hospital.name
    return db_role

@app.get("/roles/", response_model=List[RoleResponse])
async def read_roles(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    roles = db.query(Role).options(joinedload(Role.hospital)).offset(skip).limit(limit).all()
    for role in roles:
        if role.hospital:
            role.hospital_name = role.hospital.name
    return roles

@app.get("/roles/{role_id}", response_model=RoleResponse)
async def read_role(role_id: int, db: Session = Depends(get_db)):
    role = db.query(Role).options(joinedload(Role.hospital)).filter(Role.id == role_id).first()
    if role is None:
        raise HTTPException(status_code=404, detail="Role not found")
    if role.hospital:
        role.hospital_name = role.hospital.name
    return role

@app.put("/roles/{role_id}", response_model=RoleResponse)
async def update_role(role_id: int, role: RoleCreate, db: Session = Depends(get_db)):
    db_role = db.query(Role).filter(Role.id == role_id).first()
    if db_role is None:
        raise HTTPException(status_code=404, detail="Role not found")
    
    if role.hospital_id:
        hospital = db.query(Hospital).filter(Hospital.id == role.hospital_id).first()
        if not hospital:
            raise HTTPException(status_code=404, detail="Hospital not found")

    for key, value in role.dict().items():
        setattr(db_role, key, value)
    db.commit()
    db.refresh(db_role)
    
    if db_role.hospital:
        db_role.hospital_name = db_role.hospital.name
    return db_role

@app.delete("/roles/{role_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_role(role_id: int, db: Session = Depends(get_db)):
    db_role = db.query(Role).filter(Role.id == role_id).first()
    if db_role is None:
        raise HTTPException(status_code=404, detail="Role not found")
    db.delete(db_role)
    db.commit()
    return {"message": "Role deleted successfully"}

# --- User Endpoints ---
@app.post("/users/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user_username = db.query(User).filter(User.username == user.username).first()
    if db_user_username:
        raise HTTPException(status_code=400, detail="Username already registered")
    db_user_email = db.query(User).filter(User.email == user.email).first()
    if db_user_email:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    if user.role_id:
        role = db.query(Role).filter(Role.id == user.role_id).first()
        if not role:
            raise HTTPException(status_code=404, detail="Role not found")

    hashed_password = get_password_hash(user.password)
    db_user = User(
        username=user.username,
        full_name=user.full_name,
        email=user.email,
        hashed_password=hashed_password,
        role_id=user.role_id
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    if db_user.role:
        db_user.role_name = db_user.role.role_name
    return db_user

@app.get("/users/", response_model=List[UserResponse])
async def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    users = db.query(User).options(joinedload(User.role)).offset(skip).limit(limit).all()
    for user in users:
        if user.role:
            user.role_name = user.role.role_name
    return users

@app.get("/users/{user_id}", response_model=UserResponse)
async def read_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).options(joinedload(User.role)).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    if user.role:
        user.role_name = user.role.role_name
    return user

@app.put("/users/{user_id}", response_model=UserResponse)
async def update_user(user_id: int, user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.id == user_id).first()
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check for duplicate username/email if they are being changed
    if user.username != db_user.username:
        existing_user = db.query(User).filter(User.username == user.username).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Username already registered")
    if user.email != db_user.email:
        existing_user = db.query(User).filter(User.email == user.email).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")

    if user.role_id:
        role = db.query(Role).filter(Role.id == user.role_id).first()
        if not role:
            raise HTTPException(status_code=404, detail="Role not found")

    for key, value in user.dict(exclude_unset=True).items():
        if key == "password" and value:
            setattr(db_user, "hashed_password", get_password_hash(value))
        elif key != "password":
            setattr(db_user, key, value)
    db.commit()
    db.refresh(db_user)
    
    if db_user.role:
        db_user.role_name = db_user.role.role_name
    return db_user

@app.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(user_id: int, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.id == user_id).first()
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(db_user)
    db.commit()
    return {"message": "User deleted successfully"}

# --- Doctor Endpoints ---
@app.post("/doctors/", response_model=DoctorResponse, status_code=status.HTTP_201_CREATED)
async def create_doctor(doctor: DoctorCreate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == doctor.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    hospital = db.query(Hospital).filter(Hospital.id == doctor.hospital_id).first()
    if not hospital:
        raise HTTPException(status_code=404, detail="Hospital not found")
    
    db_doctor = db.query(Doctor).filter(Doctor.user_id == doctor.user_id).first()
    if db_doctor:
        raise HTTPException(status_code=400, detail="User already has a doctor profile")

    db_doctor = Doctor(**doctor.dict())
    db.add(db_doctor)
    db.commit()
    db.refresh(db_doctor)
    
    db_doctor.username = db_doctor.user.username
    db_doctor.full_name = db_doctor.user.full_name
    db_doctor.hospital_name = db_doctor.hospital.name
    return db_doctor

@app.get("/doctors/", response_model=List[DoctorResponse])
async def read_doctors(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    doctors = db.query(Doctor).options(joinedload(Doctor.user), joinedload(Doctor.hospital)).offset(skip).limit(limit).all()
    for doctor in doctors:
        doctor.username = doctor.user.username
        doctor.full_name = doctor.user.full_name
        doctor.hospital_name = doctor.hospital.name
    return doctors

@app.get("/doctors/{doctor_id}", response_model=DoctorResponse)
async def read_doctor(doctor_id: int, db: Session = Depends(get_db)):
    doctor = db.query(Doctor).options(joinedload(Doctor.user), joinedload(Doctor.hospital)).filter(Doctor.id == doctor_id).first()
    if doctor is None:
        raise HTTPException(status_code=404, detail="Doctor not found")
    doctor.username = doctor.user.username
    doctor.full_name = doctor.user.full_name
    doctor.hospital_name = doctor.hospital.name
    return doctor

@app.put("/doctors/{doctor_id}", response_model=DoctorResponse)
async def update_doctor(doctor_id: int, doctor: DoctorCreate, db: Session = Depends(get_db)):
    db_doctor = db.query(Doctor).filter(Doctor.id == doctor_id).first()
    if db_doctor is None:
        raise HTTPException(status_code=404, detail="Doctor not found")
    
    user = db.query(User).filter(User.id == doctor.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    hospital = db.query(Hospital).filter(Hospital.id == doctor.hospital_id).first()
    if not hospital:
        raise HTTPException(status_code=404, detail="Hospital not found")

    for key, value in doctor.dict().items():
        setattr(db_doctor, key, value)
    db.commit()
    db.refresh(db_doctor)
    
    db_doctor.username = db_doctor.user.username
    db_doctor.full_name = db_doctor.user.full_name
    db_doctor.hospital_name = db_doctor.hospital.name
    return db_doctor

@app.delete("/doctors/{doctor_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_doctor(doctor_id: int, db: Session = Depends(get_db)):
    db_doctor = db.query(Doctor).filter(Doctor.id == doctor_id).first()
    if db_doctor is None:
        raise HTTPException(status_code=404, detail="Doctor not found")
    db.delete(db_doctor)
    db.commit()
    return {"message": "Doctor deleted successfully"}
