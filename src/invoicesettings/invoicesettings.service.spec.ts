import { Test, TestingModule } from '@nestjs/testing';
import { InvoicesettingsService } from './invoicesettings.service';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import * as moment from 'moment';

describe('InvoicesettingsService', () => {
  let service: InvoicesettingsService;
  let prismaService: PrismaService;
  let mailService: MailService;

  const mockPrismaService = {
    user: {
      findMany: jest.fn(),
    },
    invoice: {
      update: jest.fn(),
    },
  };

  const mockMailService = {
    sendMail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvoicesettingsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: MailService, useValue: mockMailService },
      ],
    }).compile();

    service = module.get<InvoicesettingsService>(InvoicesettingsService);
    prismaService = module.get<PrismaService>(PrismaService);
    mailService = module.get<MailService>(MailService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendOverdueReminders', () => {
    it('should send reminder for overdue invoice when lastReminderSentAt is null', async () => {
      const user = {
        id: 'user1',
        email: 'test@example.com',
        name: 'Test User',
        InvoiceSettings: [{ enableReminder: true, reminderInterval: 2 }],
        invoice: [
          {
            id: 'inv1',
            due_date: moment().subtract(5, 'days').toDate(),
            paid_status: 'Unpaid',
            lastReminderSentAt: null,
          },
        ],
        company: [{ name: 'Test Company' }],
      };

      mockPrismaService.user.findMany.mockResolvedValue([user]);

      await service.sendOverdueReminders();

      expect(mailService.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'test@example.com',
          subject: 'Overdue Invoice Reminder',
        }),
        undefined,
        'Test Company',
      );
      expect(prismaService.invoice.update).toHaveBeenCalledWith({
        where: { id: 'inv1' },
        data: { lastReminderSentAt: expect.any(Date) },
      });
    });

    it('should send reminder if interval has passed', async () => {
      const user = {
        id: 'user1',
        email: 'test@example.com',
        name: 'Test User',
        InvoiceSettings: [{ enableReminder: true, reminderInterval: 2 }],
        invoice: [
          {
            id: 'inv1',
            due_date: moment().subtract(10, 'days').toDate(),
            paid_status: 'Unpaid',
            lastReminderSentAt: moment().subtract(3, 'days').toDate(),
          },
        ],
        company: [{ name: 'Test Company' }],
      };

      mockPrismaService.user.findMany.mockResolvedValue([user]);

      await service.sendOverdueReminders();

      expect(mailService.sendMail).toHaveBeenCalled();
      expect(prismaService.invoice.update).toHaveBeenCalled();
    });

    it('should NOT send reminder if interval has NOT passed', async () => {
      const user = {
        id: 'user1',
        email: 'test@example.com',
        name: 'Test User',
        InvoiceSettings: [{ enableReminder: true, reminderInterval: 5 }],
        invoice: [
          {
            id: 'inv1',
            due_date: moment().subtract(10, 'days').toDate(),
            paid_status: 'Unpaid',
            lastReminderSentAt: moment().subtract(2, 'days').toDate(),
          },
        ],
        company: [{ name: 'Test Company' }],
      };

      mockPrismaService.user.findMany.mockResolvedValue([user]);

      await service.sendOverdueReminders();

      expect(mailService.sendMail).not.toHaveBeenCalled();
      expect(prismaService.invoice.update).not.toHaveBeenCalled();
    });

    it('should NOT send reminder if invoice is not overdue (though query filters this, double check logic)', async () => {
      // Logic relies on query to filter overdue, but let's say one slipped through or we test the daysOverdue check
      const user = {
        id: 'user1',
        email: 'test@example.com',
        name: 'Test User',
        InvoiceSettings: [{ enableReminder: true, reminderInterval: 2 }],
        invoice: [
          {
            id: 'inv1',
            due_date: moment().add(1, 'days').toDate(), // Not overdue
            paid_status: 'Unpaid',
            lastReminderSentAt: null,
          },
        ],
        company: [{ name: 'Test Company' }],
      };

      mockPrismaService.user.findMany.mockResolvedValue([user]);

      await service.sendOverdueReminders();

      expect(mailService.sendMail).not.toHaveBeenCalled();
    });
  });
});
