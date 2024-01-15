-- CreateTable
CREATE TABLE "Bybit" (
    "id" INT8 NOT NULL DEFAULT unique_rowid(),
    "address" STRING NOT NULL,
    "amount" FLOAT8,
    "transactionId" INT4 NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Bybit_pkey" PRIMARY KEY ("id")
);
