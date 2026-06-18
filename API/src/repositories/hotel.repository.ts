import { Hotel, Prisma } from '@prisma/client';
import { BaseRepository } from './baseRepository';

export class HotelRepository extends BaseRepository<Hotel> {
  async findAll(query: {
    city?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    page?: number;
    limit?: number;
  }) {
    const { city, search, minPrice, maxPrice, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;
    const where: Prisma.HotelWhereInput = { isActive: true };

    if (city) where.city = { contains: city };
    if (minPrice || maxPrice) {
      where.priceFrom = {};
      if (minPrice) where.priceFrom.gte = minPrice;
      if (maxPrice) where.priceFrom.lte = maxPrice;
    }

    if (search) {
      where.OR = [
        {
          name: { contains: search },
        },
        {
          location: { contains: search },
        },
      ];
    }

    const [hotels, total] = await Promise.all([
      this.prisma.hotel.findMany({
        where,
        skip,
        take: limit,
        include: {
          images: { orderBy: { displayOrder: 'asc' } },
          roomTypes: {
            where: { available: true },
            include: {
              features: { orderBy: { displayOrder: 'asc' } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.hotel.count({ where }),
    ]);

    return { hotels, total, page, limit };
  }

  async findById(id: bigint) {
    return this.prisma.hotel.findFirst({
      where: { id, isActive: true },
      include: {
        images: { orderBy: { displayOrder: 'asc' } },
        styles: { orderBy: { displayOrder: 'asc' } },
        amenities: { orderBy: { displayOrder: 'asc' } },
        roomTypes: {
          where: { available: true },
          include: {
            features: { orderBy: { displayOrder: 'asc' } },
          },
        },
      },
    });
  }

  async create(data: Prisma.HotelCreateInput) {
    return this.prisma.hotel.create({
      data,
      include: {
        images: true,
        styles: true,
        amenities: true,
        roomTypes: {
          include: {
            features: true,
          },
        },
      },
    });
  }

  async update(id: bigint, data: Prisma.HotelUpdateInput) {
    return this.prisma.hotel.update({
      where: { id },
      data,
      include: {
        images: true,
        styles: true,
        amenities: true,
        roomTypes: {
          include: {
            features: true,
          },
        },
      },
    });
  }

  updateImages(hotelId: bigint, images: string[]) {
    // Return the operations, not the transaction promise
    return [
      this.prisma.hotelImage.deleteMany({ where: { hotelId } }),
      this.prisma.hotelImage.createMany({ data: images.map((img, index) => ({ hotelId, imageUrl: img, displayOrder: index })) }),
    ];
  }

  updateStyles(hotelId: bigint, styles: string[]) {
    // Return the operations, not the transaction promise
    return [
      this.prisma.hotelStyle.deleteMany({ where: { hotelId } }),
      this.prisma.hotelStyle.createMany({ data: styles.map((style, index) => ({ hotelId, style, displayOrder: index })) }),
    ];
  }

  updateAmenities(hotelId: bigint, amenities: string[]) {
    // Return the operations, not the transaction promise
    return [
      this.prisma.hotelAmenity.deleteMany({ where: { hotelId } }),
      this.prisma.hotelAmenity.createMany({ data: amenities.map((amenity, index) => ({ hotelId, amenity, displayOrder: index })) }),
    ];
  }

  updateRoomTypes(hotelId: bigint, roomTypes: any[]) {
    // Return the operations, not the transaction promise
    const operations: any[] = [this.prisma.hotelRoomType.deleteMany({ where: { hotelId } })];

    for (const room of roomTypes) {
      operations.push(
        this.prisma.hotelRoomType.create({
          data: {
            hotelId,
            name: room.name,
            description: room.description,
            price: room.price,
            maxGuests: room.maxGuests,
            image: room.image,
            available: room.available,
            features: {
              create: room.features.map((feature: string, index: number) => ({
                feature,
                displayOrder: index,
              })),
            },
          },
        })
      );
    }
    return operations;
  }

  async runTransaction(transactions: any[]) {
    return this.prisma.$transaction(transactions);
  }

  async executeInteractiveTransaction(callback: (prisma: Omit<Prisma.TransactionClient, "$transaction" | "$disconnect" | "$connect" | "$on" | "$use">) => Promise<any>) {
    return this.prisma.$transaction(callback);
  }

  async softDelete(id: bigint) {
    return this.prisma.hotel.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async checkAvailability(
    id: bigint,
    checkInDate: Date,
    checkOutDate: Date,
    numberOfRooms: number
  ) {
    // Get hotel with room types
    const hotel = await this.prisma.hotel.findFirst({
      where: { id, isActive: true },
      include: {
        roomTypes: {
          where: { available: true },
        },
      },
    });

    if (!hotel) return null;

    // Check existing bookings for the date range
    const existingBookings = await this.prisma.hotelBooking.findMany({
      where: {
        hotelId: id,
        status: { in: ['pending', 'confirmed'] },
        OR: [
          {
            AND: [
              { checkInDate: { lte: checkInDate } },
              { checkOutDate: { gt: checkInDate } },
            ],
          },
          {
            AND: [
              { checkInDate: { lt: checkOutDate } },
              { checkOutDate: { gte: checkOutDate } },
            ],
          },
          {
            AND: [
              { checkInDate: { gte: checkInDate } },
              { checkOutDate: { lte: checkOutDate } },
            ],
          },
        ],
      },
      select: {
        roomTypeId: true,
        numberOfRooms: true,
      },
    });

    // Calculate available rooms per room type
    const roomTypeAvailability = hotel.roomTypes
      .map((roomType) => {
        const bookedRooms = existingBookings
          .filter((b) => b.roomTypeId === roomType.id)
          .reduce((sum, b) => sum + b.numberOfRooms, 0);
        
        const availableRooms = Math.max(0, 10 - bookedRooms); // Assuming 10 rooms per type
        return { ...roomType, availableRooms };
      })
      // Only return room types that have enough rooms available for the request
      .filter(rt => rt.availableRooms >= numberOfRooms);

    return {
      ...hotel,
      roomTypes: roomTypeAvailability,
    };
  }

  async count(): Promise<number> {
    return this.prisma.hotel.count({ where: { isActive: true } });
  }
}
