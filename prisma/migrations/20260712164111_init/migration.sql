-- CreateTable
CREATE TABLE "Unit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "department" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,
    "propertyName" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "lat" REAL NOT NULL,
    "lng" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Surveyor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT
);

-- CreateTable
CREATE TABLE "Assignment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "unitId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "shift" TEXT NOT NULL,
    "deadline" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'Scheduled',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Assignment_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AssignmentSurveyor" (
    "assignmentId" TEXT NOT NULL,
    "surveyorId" TEXT NOT NULL,

    PRIMARY KEY ("assignmentId", "surveyorId"),
    CONSTRAINT "AssignmentSurveyor_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "Assignment" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "AssignmentSurveyor_surveyorId_fkey" FOREIGN KEY ("surveyorId") REFERENCES "Surveyor" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Measurement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "assignmentId" TEXT NOT NULL,
    "internalAdmin" REAL NOT NULL DEFAULT 0,
    "internalRestroomAdmin" REAL NOT NULL DEFAULT 0,
    "internalRestroomPublic" REAL NOT NULL DEFAULT 0,
    "internalIT" REAL NOT NULL DEFAULT 0,
    "internalCirculation" REAL NOT NULL DEFAULT 0,
    "internalCarpet" REAL NOT NULL DEFAULT 0,
    "internalWood" REAL NOT NULL DEFAULT 0,
    "internalCoveredPatio" REAL NOT NULL DEFAULT 0,
    "internalService" REAL NOT NULL DEFAULT 0,
    "internalStorage" REAL NOT NULL DEFAULT 0,
    "externalCirculation" REAL NOT NULL DEFAULT 0,
    "externalParking" REAL NOT NULL DEFAULT 0,
    "externalDebrisGreen" REAL NOT NULL DEFAULT 0,
    "glassInternalMonthly" REAL NOT NULL DEFAULT 0,
    "glassExternalMonthly" REAL NOT NULL DEFAULT 0,
    "glassExternalQuarterly" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Measurement_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "Assignment" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Measurement_assignmentId_key" ON "Measurement"("assignmentId");
