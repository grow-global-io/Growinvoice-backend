import { PrismaService } from '@/prisma/prisma.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { PlanFeature, Prisma } from '@prisma/client';
import moment from 'moment';

@Injectable()
export class SharedService {
  constructor(
    private readonly prismaService: PrismaService, // Assuming PrismaService is defined elsewhere
  ) {}

  readonly message =
    'Limit exceeded. Please upgrade your plan to add more features.';

  async getUserPlan(user_id: string) {
    const userData = await this.prismaService.user.findUnique({
      where: { id: user_id },
      include: {
        company: {
          include: {
            country: true,
          },
        },
        currency: true,
        UserPlans: {
          where: {
            status: true,
            start_date: {
              lte: new Date(),
            },
            end_date: {
              gte: new Date(),
            },
          },
          include: {
            plan: {
              include: {
                PlanFeatures: true,
              },
            },
          },
        },
      },
    });
    return userData;
  }

  async checkInvoicesQuota(user_id: string, invoicesToBeAdded = 1) {
    const userPlan = await this.getUserPlan(user_id);
    const quotaCount = userPlan?.UserPlans?.reduce((acc, curr) => {
      return (
        acc +
        curr.plan.PlanFeatures.reduce((acc, curr) => {
          if (curr.feature === 'Invoice') {
            return acc + curr.count;
          }
          return acc;
        }, 0)
      );
    }, 0);
    const invoicesCount = await this.prismaService.invoice.count({
      where: {
        user_id: user_id,
      },
    });

    // if (quotaCount && invoicesCount >= quotaCount) {
    //   throw new BadRequestException(this.message);
    // }
    if (quotaCount && invoicesCount + invoicesToBeAdded > quotaCount) {
      throw new BadRequestException(this.message);
    }
    return true; // Quota available
  }

  async checkQuotationQuota(user_id: string) {
    const userPlan = await this.getUserPlan(user_id);
    const quotaCount = userPlan?.UserPlans?.reduce((acc, curr) => {
      return (
        acc +
        curr.plan.PlanFeatures.reduce((acc, curr) => {
          if (curr.feature === 'Quotation') {
            return acc + curr.count;
          }
          return acc;
        }, 0)
      );
    }, 0);
    const quotationsCount = await this.prismaService.quotation.count({
      where: {
        user_id: user_id,
      },
    });

    if (quotaCount && quotationsCount >= quotaCount) {
      throw new BadRequestException(this.message);
    }
    return true; // Quota available
  }
  async checkCustomerQuota(user_id: string) {
    const userPlan = await this.getUserPlan(user_id);
    const quotaCount = userPlan?.UserPlans?.reduce((acc, curr) => {
      return (
        acc +
        curr.plan.PlanFeatures.reduce((acc, curr) => {
          if (curr.feature === 'Customer') {
            return acc + curr.count;
          }
          return acc;
        }, 0)
      );
    }, 0);
    const customersCount = await this.prismaService.customer.count({
      where: {
        user_id: user_id,
      },
    });

    if (quotaCount && customersCount >= quotaCount) {
      throw new BadRequestException(this.message);
    }
    return true; // Quota available
  }
  async checkProductQuota(user_id: string) {
    const userPlan = await this.getUserPlan(user_id);
    const quotaCount = userPlan?.UserPlans?.reduce((acc, curr) => {
      return (
        acc +
        curr.plan.PlanFeatures.reduce((acc, curr) => {
          if (curr.feature === 'Product') {
            return acc + curr.count;
          }
          return acc;
        }, 0)
      );
    }, 0);
    const productsCount = await this.prismaService.product.count({
      where: {
        user_id: user_id,
      },
    });
    if (quotaCount && productsCount >= quotaCount) {
      throw new Error(this.message);
      throw new BadRequestException(this.message);
    }
    return true; // Quota available
  }
  async taxQuota(user_id: string) {
    const userPlan = await this.getUserPlan(user_id);
    const quotaCount = userPlan?.UserPlans?.reduce((acc, curr) => {
      return (
        acc +
        curr.plan.PlanFeatures.reduce((acc, curr) => {
          if (curr.feature === 'Tax') {
            return acc + curr.count;
          }
          return acc;
        }, 0)
      );
    }, 0);
    const taxCount = await this.prismaService.tax.count({
      where: {
        user_id: user_id,
      },
    });
    if (quotaCount && taxCount >= quotaCount) {
      throw new BadRequestException(this.message);
    }
    return true; // Quota available
  }

  async checkHsnCodeQuota(user_id: string) {
    const userPlan = await this.getUserPlan(user_id);
    const quotaCount = userPlan?.UserPlans?.reduce((acc, curr) => {
      return (
        acc +
        curr.plan.PlanFeatures.reduce((acc, curr) => {
          if (curr.feature === 'HSNCode') {
            return acc + curr.count;
          }
          return acc;
        }, 0)
      );
    }, 0);
    const hsnCodeCount = await this.prismaService.hSNCode.count({
      where: {
        user_id: user_id,
      },
    });
    if (quotaCount && hsnCodeCount >= quotaCount) {
      throw new BadRequestException(this.message);
    }
    return true; // Quota available
  }

  async checkProductUnitQuota(user_id: string) {
    const userPlan = await this.getUserPlan(user_id);
    const quotaCount = userPlan?.UserPlans?.reduce((acc, curr) => {
      return (
        acc +
        curr.plan.PlanFeatures.reduce((acc, curr) => {
          if (curr.feature === 'ProductUnit') {
            return acc + curr.count;
          }
          return acc;
        }, 0)
      );
    }, 0);
    const productUnitCount = await this.prismaService.productUnit.count({
      where: {
        user_id: user_id,
      },
    });
    if (quotaCount && productUnitCount >= quotaCount) {
      throw new BadRequestException(this.message);
    }
    return true; // Quota available
  }

  async checkPaymentDetailsQuota(user_id: string) {
    const userPlan = await this.getUserPlan(user_id);
    const quotaCount = userPlan?.UserPlans?.reduce((acc, curr) => {
      return (
        acc +
        curr.plan.PlanFeatures.reduce((acc, curr) => {
          if (curr.feature === 'PaymentDetails') {
            return acc + curr.count;
          }
          return acc;
        }, 0)
      );
    }, 0);
    const paymentDetailsCount = await this.prismaService.paymentDetails.count({
      where: {
        user_id: user_id,
      },
    });
    if (quotaCount && paymentDetailsCount >= quotaCount) {
      throw new BadRequestException(this.message);
    }
    return true; // Quota available
  }

  async invoiceSettings(user_id: string) {
    const userPlan = await this.getUserPlan(user_id);
    const quotaCount = userPlan?.UserPlans?.reduce((acc, curr) => {
      return (
        acc +
        curr.plan.PlanFeatures.reduce((acc, curr) => {
          if (curr.feature === 'InvoiceSettings') {
            return acc + curr.count;
          }
          return acc;
        }, 0)
      );
    }, 0);
    const invoiceSettingsCount = await this.prismaService.invoiceSettings.count(
      {
        where: {
          user_id: user_id,
        },
      },
    );
    if (quotaCount && invoiceSettingsCount >= quotaCount) {
      throw new BadRequestException(this.message);
    }
    return true; // Quota available
  }

  async checkQuotationSettingsQuota(user_id: string) {
    const userPlan = await this.getUserPlan(user_id);
    const quotaCount = userPlan?.UserPlans?.reduce((acc, curr) => {
      return (
        acc +
        curr.plan.PlanFeatures.reduce((acc, curr) => {
          if (curr.feature === 'QuotationSettings') {
            return acc + curr.count;
          }
          return acc;
        }, 0)
      );
    }, 0);
    const quotationSettingsCount =
      await this.prismaService.quotationSettings.count({
        where: {
          user_id: user_id,
        },
      });
    if (quotaCount && quotationSettingsCount >= quotaCount) {
      throw new BadRequestException(this.message);
    }
    return true; // Quota available
  }

  async checkPaymentsQuota(user_id: string) {
    const userPlan = await this.getUserPlan(user_id);
    const quotaCount = userPlan?.UserPlans?.reduce((acc, curr) => {
      return (
        acc +
        curr.plan.PlanFeatures.reduce((acc, curr) => {
          if (curr.feature === 'Payments') {
            return acc + curr.count;
          }
          return acc;
        }, 0)
      );
    }, 0);
    const paymentsCount = await this.prismaService.payments.count({
      where: {
        user_id: user_id,
      },
    });
    if (quotaCount && paymentsCount >= quotaCount) {
      throw new BadRequestException(this.message);
    }
    return true; // Quota available
  }

  async checkTaxCodeQuota(user_id: string) {
    const userPlan = await this.getUserPlan(user_id);
    const quotaCount = userPlan?.UserPlans?.reduce((acc, curr) => {
      return (
        acc +
        curr.plan.PlanFeatures.reduce((acc, curr) => {
          if (curr.feature === 'Tax') {
            return acc + curr.count;
          }
          return acc;
        }, 0)
      );
    }, 0);
    const taxCodeCount = await this.prismaService.tax.count({
      where: {
        user_id: user_id,
      },
    });
    if (quotaCount && taxCodeCount >= quotaCount) {
      throw new BadRequestException(this.message);
    }
    return true; // Quota available
  }

  async getQuota(user_id: string) {
    const userPlan = await this.getUserPlan(user_id);

    if (!userPlan?.UserPlans?.length) {
      throw new BadRequestException('User plan not found');
    }

    const startDates = userPlan.UserPlans.map((plan) => plan.start_date);
    const endDates = userPlan.UserPlans.map((plan) => plan.end_date);

    const initialDate = new Date(
      Math.min(...startDates.map((date) => date.getTime())),
    );
    const finalDate = new Date(
      Math.max(...endDates.map((date) => date.getTime())),
    );

    const featureQuotaPromises = Object.keys(PlanFeature).map(async (key) => {
      const queryOptions = {
        where: {
          user_id,
          createdAt: {
            gte: initialDate,
            lte: finalDate,
          },
        },
      };

      const quotaCount = userPlan?.UserPlans?.reduce((acc, curr) => {
        return (
          acc +
          curr.plan.PlanFeatures.reduce((acc, curr) => {
            if (curr.feature === key) {
              return acc + curr.count;
            }
            return acc;
          }, 0)
        );
      }, 0);

      switch (key) {
        case 'Invoice':
          const invoicesCount =
            await this.prismaService.invoice.count(queryOptions);
          return { feature: key, quotaCount, usedCount: invoicesCount };

        case 'Quotation':
          const quotationsCount =
            await this.prismaService.quotation.count(queryOptions);
          return { feature: key, quotaCount, usedCount: quotationsCount };

        case 'Customer':
          const customersCount =
            await this.prismaService.customer.count(queryOptions);
          return { feature: key, quotaCount, usedCount: customersCount };

        case 'Product':
          const productsCount =
            await this.prismaService.product.count(queryOptions);
          return { feature: key, quotaCount, usedCount: productsCount };

        case 'Tax':
          const taxCount = await this.prismaService.tax.count(queryOptions);
          return { feature: key, quotaCount, usedCount: taxCount };

        case 'HSNCode':
          const hsnCodeCount =
            await this.prismaService.hSNCode.count(queryOptions);
          return { feature: key, quotaCount, usedCount: hsnCodeCount };

        case 'ProductUnit':
          const productUnitCount =
            await this.prismaService.productUnit.count(queryOptions);
          return { feature: key, quotaCount, usedCount: productUnitCount };

        case 'PaymentDetails':
          const paymentDetailsCount =
            await this.prismaService.paymentDetails.count(queryOptions);
          return { feature: key, quotaCount, usedCount: paymentDetailsCount };

        case 'InvoiceSettings':
          const invoiceSettingsCount =
            await this.prismaService.invoiceSettings.count(queryOptions);
          return { feature: key, quotaCount, usedCount: invoiceSettingsCount };

        case 'QuotationSettings':
          const quotationSettingsCount =
            await this.prismaService.quotationSettings.count(queryOptions);
          return {
            feature: key,
            quotaCount,
            usedCount: quotationSettingsCount,
          };

        case 'Payments':
          const paymentsCount =
            await this.prismaService.payments.count(queryOptions);
          return { feature: key, quotaCount, usedCount: paymentsCount };

        default:
          return null;
      }
    });

    const featuresQuota = await Promise.all(featureQuotaPromises);

    return featuresQuota?.filter(Boolean);
  }
}
