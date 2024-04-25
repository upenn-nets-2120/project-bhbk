import { Input, InputProps } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LabelProps } from "@radix-ui/react-label";
import React, { FC } from "react";

interface InputFormProps {
  label: string;
  placeholder: string;
  inputProps?: InputProps;
  labelProps?: LabelProps;
  setValue?: (value: any) => void;
}

export const InputForm: FC<InputFormProps> = ({
  label,
  placeholder,
  inputProps,
  labelProps,
  setValue,
}) => {
  const onChangeEvent = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;

    if (setValue) {
      setValue(value);
    }
  };

  return (
    <div className="flex flex-col space-y-1.5">
      <Label htmlFor={label.toLowerCase()} {...labelProps}>
        {label}
      </Label>
      <Input
        id={label.toLowerCase()}
        placeholder={placeholder}
        onChange={onChangeEvent}
        {...inputProps}
      />
    </div>
  );
};
