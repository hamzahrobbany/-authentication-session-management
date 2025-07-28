/*
  Warnings:

  - You are about to drop the `VehicleImage` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "VehicleImage" DROP CONSTRAINT "VehicleImage_vehicleId_fkey";

-- DropTable
DROP TABLE "VehicleImage";
