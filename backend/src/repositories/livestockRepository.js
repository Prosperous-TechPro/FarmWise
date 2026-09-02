/**
 * Livestock repository layer
 */

import prisma from '../lib/prisma.js';

export async function listLivestockForFarm(farmId, filters = {}) {
  return prisma.livestock.findMany({
    where: {
      farmId,
      ...(filters.speciesId ? { speciesId: filters.speciesId } : {}),
      ...(filters.breedId ? { breedId: filters.breedId } : {}),
      ...(filters.sex ? { sex: filters.sex } : {}),
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.tagNumber ? { tagNumber: { contains: filters.tagNumber, mode: 'insensitive' } } : {}),
    },
    include: {
      species: true,
      breed: true,
    },
    orderBy: { createdAt: 'desc' },
    skip: filters.skip || 0,
    take: filters.limit || 20,
  });
}

export async function getLivestockById(animalId) {
  return prisma.livestock.findUnique({
    where: { id: animalId },
    include: {
      species: true,
      breed: true,
      farm: true,
      events: {
        orderBy: { eventDate: 'desc' },
      },
    },
  });
}

export async function createLivestock(data) {
  return prisma.livestock.create({
    data,
    include: {
      species: true,
      breed: true,
      farm: true,
    },
  });
}

export async function updateLivestock(animalId, data) {
  return prisma.livestock.update({
    where: { id: animalId },
    data,
    include: {
      species: true,
      breed: true,
      farm: true,
    },
  });
}

export async function listLivestockSpecies() {
  return prisma.livestockSpecies.findMany({
    orderBy: { name: 'asc' },
  });
}

export async function createLivestockSpecies(name, description) {
  return prisma.livestockSpecies.create({
    data: {
      name,
      description,
    },
  });
}

export async function listLivestockBreeds(speciesId) {
  return prisma.livestockBreed.findMany({
    where: speciesId ? { speciesId } : undefined,
    orderBy: { name: 'asc' },
  });
}

export async function createBreedingRecord(data) {
  return prisma.breedingRecord.create({
    data,
  });
}

export async function getBreedingRecordById(recordId) {
  return prisma.breedingRecord.findUnique({
    where: { id: recordId },
    include: {
      female: true,
      male: true,
    },
  });
}

export async function listBreedingRecordsForAnimal(animalId) {
  return prisma.breedingRecord.findMany({
    where: {
      OR: [{ femaleId: animalId }, { maleId: animalId }],
    },
    orderBy: { matingDate: 'desc' },
  });
}

export async function createLivestockEvent(data) {
  return prisma.livestockEvent.create({
    data,
  });
}

export async function createWeightRecord(data) {
  return prisma.livestockWeight.create({
    data,
  });
}

export async function listWeightRecordsForAnimal(animalId) {
  return prisma.livestockWeight.findMany({
    where: { livestockId: animalId },
    orderBy: { measurementDate: 'desc' },
  });
}

export async function createHealthRecord(data) {
  return prisma.healthRecord.create({
    data,
  });
}

export async function listHealthRecordsForAnimal(animalId) {
  return prisma.healthRecord.findMany({
    where: { livestockId: animalId },
    orderBy: { eventDate: 'desc' },
  });
}

export async function createTreatmentRecord(data) {
  return prisma.treatmentRecord.create({
    data,
  });
}

export async function listTreatmentRecordsForAnimal(animalId) {
  return prisma.treatmentRecord.findMany({
    where: { livestockId: animalId },
    orderBy: { startDate: 'desc' },
  });
}

export async function createVaccinationRecord(data) {
  return prisma.vaccinationRecord.create({
    data,
  });
}

export async function listVaccinationRecordsForAnimal(animalId) {
  return prisma.vaccinationRecord.findMany({
    where: { livestockId: animalId },
    orderBy: { dateAdministered: 'desc' },
  });
}

export async function createFeedingRecord(data) {
  return prisma.feedingRecord.create({
    data,
  });
}

export async function listFeedingRecordsForAnimal(animalId) {
  return prisma.feedingRecord.findMany({
    where: { livestockId: animalId },
    orderBy: { feedingDate: 'desc' },
  });
}

export default {
  listLivestockForFarm,
  getLivestockById,
  createLivestock,
  updateLivestock,
  listLivestockSpecies,
  createLivestockSpecies,
  listLivestockBreeds,
  createBreedingRecord,
  getBreedingRecordById,
  listBreedingRecordsForAnimal,
  createLivestockEvent,
  createWeightRecord,
  listWeightRecordsForAnimal,
  createHealthRecord,
  listHealthRecordsForAnimal,
  createTreatmentRecord,
  listTreatmentRecordsForAnimal,
  createVaccinationRecord,
  listVaccinationRecordsForAnimal,
  createFeedingRecord,
  listFeedingRecordsForAnimal,
};
