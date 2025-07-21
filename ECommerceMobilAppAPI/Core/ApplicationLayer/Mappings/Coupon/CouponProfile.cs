using AutoMapper;
using DomainLayer.Entities;
using ApplicationLayer.DTOs.Coupon;

namespace ApplicationLayer.Mappings.Coupon
{
    public class CouponProfile : Profile
    {
        public CouponProfile()
        {
            CreateMap<DomainLayer.Entities.Coupon, CouponDto>()
                .ForMember(dest => dest.Type, opt => opt.MapFrom(src => (int)src.Type))
                .ReverseMap()
                .ForMember(dest => dest.Type, opt => opt.MapFrom(src => (CouponType)src.Type));

            CreateMap<DomainLayer.Entities.Coupon, CreateCouponDto>()
                .ForMember(dest => dest.Type, opt => opt.MapFrom(src => (int)src.Type))
                .ReverseMap()
                .ForMember(dest => dest.Type, opt => opt.MapFrom(src => (CouponType)src.Type));

            CreateMap<DomainLayer.Entities.Coupon, UpdateCouponDto>()
                .ForMember(dest => dest.Type, opt => opt.MapFrom(src => (int)src.Type))
                .ReverseMap()
                .ForMember(dest => dest.Type, opt => opt.MapFrom(src => (CouponType)src.Type));
        }
    }
}