/*
  Warnings:

  - You are about to drop the column `ownerId` on the `file` table. All the data in the column will be lost.
  - Added the required column `download_url` to the `File` table without a default value. This is not possible if the table is not empty.
  - Added the required column `owner_id` to the `File` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `file` DROP FOREIGN KEY `File_ownerId_fkey`;

-- AlterTable
ALTER TABLE `file` DROP COLUMN `ownerId`,
    ADD COLUMN `download_url` VARCHAR(191) NOT NULL,
    ADD COLUMN `owner_id` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `File` ADD CONSTRAINT `File_owner_id_fkey` FOREIGN KEY (`owner_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
