using AutoMapper;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ApplicationLayer.Mappings.AppUser
{
    public class AppUserProfile : Profile
    {
        public AppUserProfile() 
        {
            CreateMap<DomainLayer.Entities.AppUser, ApplicationLayer.DTOs.AppUser.AppUserDto>().ReverseMap();
        } 
    }
}
