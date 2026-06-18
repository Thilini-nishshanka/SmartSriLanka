import { TourRepository } from '../repositories';
import { CreateTourDTO, UpdateTourDTO, TourQueryDTO, TourDTO } from '../types/dto/tour.dto';
import { Prisma } from '@prisma/client';
import { BigIntUtil } from '../utils/bigint.util';
import { AppError } from '../utils/error.util';

export class TourService {
  private tourRepository: TourRepository;

  constructor() {
    this.tourRepository = new TourRepository();
  }

  async getAllTours(query: TourQueryDTO) {
    const result = await this.tourRepository.findAll(query);

    const tours = result.tours.map((tour) => this.mapTourToDTO(tour));

    return {
      tours: tours,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: Math.ceil(result.total / result.limit),
      },
    };
  }

  async getTourById(id: string): Promise<TourDTO> {
    const tour = await this.tourRepository.findById(BigIntUtil.toBigInt(id));

    if (!tour) {
      throw new AppError('Tour not found', 404);
    }

    return this.mapTourToDTO(tour);
  }

  async createTour(dto: CreateTourDTO): Promise<TourDTO> {
    const tourData: any = {
      name: dto.name,
      category: dto.category,
      location: dto.location,
      duration: dto.duration,
      price: dto.price,
      description: dto.description,
      numberOfDays: dto.numberOfDays,
      mainImage: dto.images && dto.images.length > 0 ? dto.images[0] : undefined,
      mapEmbed: dto.mapEmbed,
    };

    if (dto.images) {
      tourData.images = {
        create: dto.images.map((img, index) => ({
          imageUrl: img,
          displayOrder: index,
        })),
      };
    }

    if (dto.highlights) {
      tourData.highlights = {
        create: dto.highlights.map((h, index) => ({
          highlight: h,
          displayOrder: index,
        })),
      };
    }

    if (dto.included) {
      tourData.inclusions = {
        create: dto.included.map((i, index) => ({
          inclusion: i,
          displayOrder: index,
        })),
      };
    }

    if (dto.itinerary) {
      tourData.itineraryDays = {
        create: dto.itinerary.map((day) => ({
          dayNumber: day.day,
          title: day.title,
          meals: day.meals ?? [],
          accommodation: day.accommodation ?? null,
          stops: {
            create: day.stops.map((stop, index) => ({
              stopOrder: index + 1,
              name: stop.name,
              description: stop.description ?? null,
              duration: stop.duration,
              latitude: stop.location?.lat ?? null,
              longitude: stop.location?.lng ?? null,
              admissionIncluded: stop.admissionIncluded ?? false,
            })),
          },
        })),
      };
    }

    const tour = await this.tourRepository.create(tourData);
    return this.mapTourToDTO(tour);
  }

  async updateTour(id: string, dto: UpdateTourDTO): Promise<TourDTO> {
    // Separate relational data from direct tour fields
    const { images, highlights, included, itinerary, ...tourUpdateData } = dto;
    
    // Build a clean update payload to avoid passing `undefined` to Prisma.
    // Prisma expects `null` to clear a field, and `undefined` means "do not touch".
    const updatePayload: Prisma.TourUpdateInput = {};
    
    // Explicitly copy defined properties from the DTO to the payload.
    // This prevents any 'undefined' values from being included.
    Object.keys(tourUpdateData).forEach(key => {
      const typedKey = key as keyof typeof tourUpdateData;
      if (tourUpdateData[typedKey] !== undefined) {
        (updatePayload as any)[typedKey] = tourUpdateData[typedKey];
      }
    });

    // The `image` property from the DTO is for the main cover image, but it conflicts with the `images` relation.
    // We handle setting `mainImage` separately, so we must remove `image` from the direct payload.
    delete (updatePayload as any).image;

    // Set the mainImage to the first image in the array if it exists
    if (images !== undefined) {
  updatePayload.mainImage = images.length > 0 ? (images[0] ?? null) : null;
}

    // Handle relational updates for images
    if (images) {
      updatePayload.images = {
        deleteMany: {},
        create: images.map((imageUrl, index) => ({
          imageUrl,
          displayOrder: index,
        })),
      };
    }

    // Handle relational updates for highlights
    if (highlights) {
      updatePayload.highlights = {
        deleteMany: {},
        create: highlights.map((highlight, index) => ({
          highlight,
          displayOrder: index,
        })),
      };
    }

    // Handle relational updates for inclusions
    if (included) {
      updatePayload.inclusions = {
        deleteMany: {},
        create: included.map((inclusion, index) => ({
          inclusion,
          displayOrder: index,
        })),
      };
    };
    
    // Handle relational updates for itinerary
    if (itinerary) {
      updatePayload.itineraryDays = {
        deleteMany: {}, // Delete all existing days for this tour
        create: itinerary.map((day) => ({
          dayNumber: day.day,
          title: day.title,
          meals: day.meals ?? [],
          accommodation: day.accommodation ?? null,
          stops: {
            create: day.stops.map((stop, index) => ({
              stopOrder: index + 1,
              name: stop.name,
              description: stop.description ?? null,
              duration: stop.duration,
              latitude: stop.location?.lat ?? null,
              longitude: stop.location?.lng ?? null,
              admissionIncluded: stop.admissionIncluded ?? false,
            })),
          },
        })),
      };
    }

    const tour = await this.tourRepository.update(BigIntUtil.toBigInt(id), updatePayload);
    return this.mapTourToDTO(tour);
  }

  async deleteTour(id: string): Promise<void> {
    await this.tourRepository.softDelete(BigIntUtil.toBigInt(id));
  }

  async getCategories(): Promise<string[]> {
    const categories = await this.tourRepository.getCategories();
    return categories.map((c) => c.category);
  }

  private mapTourToDTO(tour: any): TourDTO {
    return {
      id: Number(tour.id),
      name: tour.name,
      category: tour.category,
      location: tour.location,
      duration: tour.duration,
      price: Number(tour.price),
      rating: Number(tour.rating),
      reviewsCount: tour.reviewsCount,
      image: tour.mainImage || tour.images?.[0]?.imageUrl || undefined,
      images: tour.images?.map((img: any) => img.imageUrl) || [],
      description: tour.description,
      highlights: tour.highlights?.map((h: any) => h.highlight) || [],
      included: tour.inclusions?.map((i: any) => i.inclusion) || [],
      numberOfDays: tour.numberOfDays,
      mapEmbed: tour.mapEmbed || undefined,
      itinerary: tour.itineraryDays?.map((day: any) => ({
        day: day.dayNumber,
        title: day.title,
        stops: day.stops?.map((stop: any) => ({
          name: stop.name,
          duration: stop.duration,
          description: stop.description ?? undefined,
          admissionIncluded: stop.admissionIncluded ?? false,
          location: stop.latitude && stop.longitude ? {
            lat: Number(stop.latitude),
            lng: Number(stop.longitude),
          } : undefined
        })) || [],
        meals: day.meals as string[],
        accommodation: day.accommodation || undefined,
      })) || [],
      createdAt: tour.createdAt,
      updatedAt: tour.updatedAt,
    };
  }
}