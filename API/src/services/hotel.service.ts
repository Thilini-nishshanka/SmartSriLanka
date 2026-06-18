import { HotelRepository } from '../repositories/hotel.repository';
import { BigIntUtil } from '../utils/bigint.util';
import { CreateHotelDTO, UpdateHotelDTO, HotelQueryDTO, HotelDTO, CheckAvailabilityDTO } from '../types/dto/hotel.dto';

export class HotelService {
  private hotelRepository: HotelRepository;

  constructor() {
    this.hotelRepository = new HotelRepository();
  }

  async getAllHotels(query: HotelQueryDTO) {
    const result = await this.hotelRepository.findAll(query);

    const hotels = result.hotels.map((hotel) => this.mapHotelToDTO(hotel));

    return {
      hotels: hotels,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: Math.ceil(result.total / result.limit),
      },
    };
  }

  async getHotelById(id: string): Promise<HotelDTO> {
    const hotel = await this.hotelRepository.findById(BigIntUtil.toBigInt(id));

    if (!hotel) {
      throw new Error('Hotel not found');
    }

    return this.mapHotelToDTO(hotel);
  }

  async createHotel(dto: CreateHotelDTO): Promise<HotelDTO> {
    const hotelData: any = {
      name: dto.name,
      location: dto.location,
      city: dto.city,
      priceFrom: dto.priceFrom,
      description: dto.description,
      hotelClass: dto.hotelClass,
      mainImage: dto.mainImage,
      mapEmbed: dto.mapEmbed,
      latitude: dto.coordinates?.lat,
      longitude: dto.coordinates?.lng,
      rating: dto.rating,
      reviewsCount: dto.reviewsCount,
    };

    if (dto.images) {
      hotelData.images = {
        create: dto.images.map((img: string, index: number) => ({
          imageUrl: img,
          displayOrder: index,
        })),
      };
    }

    if (dto.hotelStyle) {
      hotelData.styles = {
        create: dto.hotelStyle.map((style: string, index: number) => ({
          style,
          displayOrder: index,
        })),
      };
    }

    if (dto.propertyAmenities) {
      hotelData.amenities = {
        create: dto.propertyAmenities.map((amenity: string, index: number) => ({
          amenity,
          displayOrder: index,
        })),
      };
    }

    if (dto.roomTypes) {
      hotelData.roomTypes = {
        create: dto.roomTypes.map((room: any) => ({
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
        })),
      };
    }

    const hotel = await this.hotelRepository.create(hotelData);
    return this.mapHotelToDTO(hotel);
  }

  async updateHotel(id: string, dto: UpdateHotelDTO): Promise<HotelDTO> {
    const hotelId = BigIntUtil.toBigInt(id);

    await this.hotelRepository.executeInteractiveTransaction(async (prisma) => {
      // 1. Update the main hotel data
      const updateData: any = {
        name: dto.name,
        location: dto.location,
        city: dto.city,
        priceFrom: dto.priceFrom,
        description: dto.description,
        hotelClass: dto.hotelClass,
        mainImage: dto.mainImage,
        mapEmbed: dto.mapEmbed,
        rating: dto.rating,
        reviewsCount: dto.reviewsCount,
        isActive: dto.isActive,
      };
      if (dto.coordinates) {
        updateData.latitude = dto.coordinates.lat;
        updateData.longitude = dto.coordinates.lng;
      }
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined) delete updateData[key];
      });
      if (Object.keys(updateData).length > 0) {
        await prisma.hotel.update({ where: { id: hotelId }, data: updateData });
      }

      // 2. Update related one-to-many records
      if (dto.images) {
        await prisma.hotelImage.deleteMany({ where: { hotelId } });
        if (dto.images.length > 0) {
          await prisma.hotelImage.createMany({ data: dto.images.map((img, i) => ({ hotelId, imageUrl: img, displayOrder: i })) });
        }
      }
      if (dto.hotelStyle) {
        await prisma.hotelStyle.deleteMany({ where: { hotelId } });
        if (dto.hotelStyle.length > 0) {
          await prisma.hotelStyle.createMany({ data: dto.hotelStyle.map((style, i) => ({ hotelId, style, displayOrder: i })) });
        }
      }
      if (dto.propertyAmenities) {
        await prisma.hotelAmenity.deleteMany({ where: { hotelId } });
        if (dto.propertyAmenities.length > 0) {
          await prisma.hotelAmenity.createMany({ data: dto.propertyAmenities.map((amenity, i) => ({ hotelId, amenity, displayOrder: i })) });
        }
      }
      if (dto.roomTypes) {
        await prisma.hotelRoomType.deleteMany({ where: { hotelId } });
        if (dto.roomTypes.length > 0) {
          for (const room of dto.roomTypes) {
            await prisma.hotelRoomType.create({ data: { hotelId, ...room, features: { create: room.features.map((f, i) => ({ feature: f, displayOrder: i })) } } as any });
          }
        }
      }
    });

    const hotel = await this.hotelRepository.findById(hotelId);
    if (!hotel) {
      throw new Error('Failed to retrieve updated hotel');
    }

    return this.mapHotelToDTO(hotel);
  }

  async deleteHotel(id: string): Promise<void> {
    await this.hotelRepository.softDelete(BigIntUtil.toBigInt(id));
  }

  async checkAvailability(id: string, dto: CheckAvailabilityDTO) {
    const checkInDate = new Date(dto.checkInDate);
    const checkOutDate = new Date(dto.checkOutDate);

    const result = await this.hotelRepository.checkAvailability(
      BigIntUtil.toBigInt(id),
      checkInDate,
      checkOutDate,
      dto.numberOfRooms
    );

    if (!result) {
      throw new Error('Hotel not found');
    }

    return result;
  }

  private mapHotelToDTO(hotel: any): HotelDTO {
    return {
      id: Number(hotel.id),
      name: hotel.name,
      location: hotel.location,
      city: hotel.city,
      rating: Number(hotel.rating),
      reviewsCount: hotel.reviewsCount,
      priceFrom: Number(hotel.priceFrom),
      image: hotel.mainImage || undefined,
      images: hotel.images?.map((img: any) => img.imageUrl) || [],
      description: hotel.description,
      hotelClass: hotel.hotelClass,
      hotelStyle: hotel.styles?.map((s: any) => s.style) || [],
      propertyAmenities: hotel.amenities?.map((a: any) => a.amenity) || [],
      coordinates: hotel.latitude && hotel.longitude ? {
        lat: Number(hotel.latitude),
        lng: Number(hotel.longitude),
      } : { lat: 0, lng: 0 },
      mapEmbed: hotel.mapEmbed || undefined,
      roomTypes: hotel.roomTypes?.map((room: any) => ({
        id: Number(room.id),
        hotelId: Number(hotel.id),
        name: room.name,
        description: room.description || '',
        price: Number(room.price),
        maxGuests: room.maxGuests,
        features: room.features?.map((f: any) => f.feature) || [],
        image: room.image || undefined,
        available: room.available,
      })) || [],
      createdAt: hotel.createdAt,
      updatedAt: hotel.updatedAt,
    };
  }
}