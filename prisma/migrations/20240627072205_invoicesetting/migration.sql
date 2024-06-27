-- CreateTable
CREATE TABLE "InvoiceSettings" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "isExist" BOOLEAN NOT NULL DEFAULT true,
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "invoiceTemplateId" TEXT NOT NULL,
    "invoicePrefix" TEXT NOT NULL,
    "autoArchive" BOOLEAN NOT NULL,
    "footer" TEXT NOT NULL,
    "notes" TEXT NOT NULL,
    "dueNotice" INTEGER NOT NULL,
    "overDueNotice" INTEGER NOT NULL,
    "companyAddressTemplate" TEXT NOT NULL,
    "customerBillingAddressTemplate" TEXT NOT NULL,
    "customerShippingAddressTemplate" TEXT NOT NULL,

    CONSTRAINT "InvoiceSettings_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "InvoiceSettings" ADD CONSTRAINT "InvoiceSettings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceSettings" ADD CONSTRAINT "InvoiceSettings_invoiceTemplateId_fkey" FOREIGN KEY ("invoiceTemplateId") REFERENCES "invoiceTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
