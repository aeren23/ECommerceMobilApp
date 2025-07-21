using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ApplicationLayer.Wrappers
{
    public class ServiceResponse<T>
    {
        public T Value { get; set; }
        public bool Success => string.IsNullOrEmpty(ErrorMessage);
        public string ErrorMessage { get; set; }

        public ServiceResponse(T value)
        {
            Value = value;
        }

        public ServiceResponse(string errorMessage)
        {
            ErrorMessage = errorMessage;
        }
    }
}
