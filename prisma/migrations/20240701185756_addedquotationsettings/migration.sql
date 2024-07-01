-- AlterTable
ALTER TABLE "Quotation" ADD COLUMN     "template_id" TEXT;

-- CreateTable
CREATE TABLE "QuotationTemplate" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "isExist" BOOLEAN NOT NULL DEFAULT true,
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "view" TEXT NOT NULL,
    "path" TEXT,

    CONSTRAINT "QuotationTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuotationSettings" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "isExist" BOOLEAN NOT NULL DEFAULT true,
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "quotationTemplateId" TEXT NOT NULL,
    "quotationPrefix" TEXT NOT NULL,
    "autoArchive" BOOLEAN NOT NULL DEFAULT false,
    "autoConvert" BOOLEAN NOT NULL DEFAULT false,
    "footer" TEXT,
    "notes" TEXT,
    "companyAddressTemplate" TEXT NOT NULL,
    "customerBillingAddressTemplate" TEXT NOT NULL,
    "customerShippingAddressTemplate" TEXT NOT NULL,

    CONSTRAINT "QuotationSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "QuotationSettings_user_id_id_key" ON "QuotationSettings"("user_id", "id");

-- AddForeignKey
ALTER TABLE "Quotation" ADD CONSTRAINT "Quotation_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "QuotationTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuotationSettings" ADD CONSTRAINT "QuotationSettings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuotationSettings" ADD CONSTRAINT "QuotationSettings_quotationTemplateId_fkey" FOREIGN KEY ("quotationTemplateId") REFERENCES "QuotationTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
