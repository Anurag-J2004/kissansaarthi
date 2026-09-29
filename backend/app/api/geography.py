from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..models import State, District, Block, Panchayat
from ..schemas import StateOut, DistrictOut, BlockOut, PanchayatOut
from .auth import get_current_user

router = APIRouter(prefix="/geo", tags=["geography"])

@router.get("/states", response_model=List[StateOut])
def get_states(db: Session = Depends(get_db)):
    return db.query(State).all()

@router.get("/states/{state_id}/districts", response_model=List[DistrictOut])
def get_districts(state_id: str, db: Session = Depends(get_db)):
    return db.query(District).filter(District.state_id == state_id).all()

@router.get("/districts/{district_id}/blocks", response_model=List[BlockOut])
def get_blocks(district_id: str, db: Session = Depends(get_db)):
    return db.query(Block).filter(Block.district_id == district_id).all()

@router.get("/blocks/{block_id}/panchayats", response_model=List[PanchayatOut])
def get_panchayats(block_id: str, db: Session = Depends(get_db)):
    return db.query(Panchayat).filter(Panchayat.block_id == block_id).all()

@router.get("/panchayats/{panchayat_id}", response_model=PanchayatOut)
def get_panchayat(panchayat_id: str, db: Session = Depends(get_db)):
    p = db.query(Panchayat).filter(Panchayat.id == panchayat_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Panchayat not found")
    return p
