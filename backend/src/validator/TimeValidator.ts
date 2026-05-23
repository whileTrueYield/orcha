import { ValidationOptions, registerDecorator } from "class-validator";

export function IsMilitaryTime(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: "isMilitaryTime",
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (typeof value !== "string") {
            return false;
          }

          const isFormatValid = /^\d{2}:\d{2}$/.test(value);
          if (!isFormatValid) {
            return false;
          }

          const [hours, minutes] = value.split(":");
          return parseInt(hours) < 24 && parseInt(minutes) < 60;
        },
      },
    });
  };
}
