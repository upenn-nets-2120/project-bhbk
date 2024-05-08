import { Input, InputProps } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea, TextareaProps } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { LabelProps } from "@radix-ui/react-label";
import React, { FC } from "react";

interface TextareaFormProps {
  label: string;
  placeholder: string;
  textareaProps?: TextareaProps;
  labelProps?: LabelProps;
  setValue?: (value: any) => void;
  value?: any;
  disabled?: boolean;
  className?: string;
}

export const TextareaForm: FC<TextareaFormProps> = ({
  label,
  placeholder,
  textareaProps,
  labelProps,
  setValue,
  value,
  disabled,
  className,
}) => {
  const onChangeEvent = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = event.target.value;

    if (setValue) {
      setValue(value);
    }
  };

  return (
    <div className={cn("flex flex-col space-y-1.5", className)}>
      <Label htmlFor={label.toLowerCase()} {...labelProps}>
        {label}
      </Label>
      <Textarea
        id={label.toLowerCase()}
        placeholder={placeholder}
        onChange={onChangeEvent}
        value={value}
        disabled={disabled}
        {...textareaProps}
      />
    </div>
  );
};
