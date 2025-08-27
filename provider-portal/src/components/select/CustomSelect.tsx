import { cn } from '@/lib/utils';
import Select, {
  Props as ReactSelectProps,
  GroupBase,
  OptionsOrGroups,
  SingleValue,
  MultiValue
} from 'react-select';

interface GenericSelectProps<Option, IsMulti extends boolean = false>
  extends ReactSelectProps<Option, IsMulti, GroupBase<Option>> {
  options: OptionsOrGroups<Option, GroupBase<Option>>;
  className?: string;
  value?: any;
  onChange: (value: IsMulti extends true ? MultiValue<Option> : SingleValue<Option>) => void;
}

const CustomSelect = <Option, IsMulti extends boolean = false>({
  options,
  onChange,
  className,
  value,
  isMulti,
  ...rest
}: GenericSelectProps<Option, IsMulti>) => {
  const defaultValue = (value: any) => {
    return options ? options.find((option: any) => option.value === value) : '';
  };
  const multiValue = (values: any) => {
    return options
      ? values.map((value: any) => options.find((option: any) => option.value === value))
      : [];
  };

  return (
    <Select<Option, IsMulti, GroupBase<Option>>
      className={cn('w-full text-[13px] font-medium', className)}
      styles={{
        control: (provided, state) => ({
          ...provided,
          borderColor: state.isFocused ? '#752C84' : '#d1d5db',
          borderWidth: '1px',
          boxShadow: state.isFocused ? '0 0 0 1px #752C84' : 'none',
          '&:hover': {
            borderColor: state.isFocused ? '#752C84' : '#9ca3af',
          },
          minHeight: '2.5rem',
        }),
        option: (provided, state) => ({
          ...provided,
          backgroundColor: state.isSelected 
            ? '#752C84' 
            : state.isFocused 
              ? '#faf5ff' 
              : 'transparent',
          color: state.isSelected 
            ? '#ffffff' 
            : state.isFocused 
              ? '#752C84' 
              : '#111827',
          '&:hover': {
            backgroundColor: state.isSelected ? '#752C84' : '#faf5ff',
            color: state.isSelected ? '#ffffff' : '#752C84',
          },
        }),
        multiValue: (provided) => ({
          ...provided,
          backgroundColor: '#f3e8ff',
        }),
        multiValueLabel: (provided) => ({
          ...provided,
          color: '#752C84',
        }),
        multiValueRemove: (provided) => ({
          ...provided,
          color: '#752C84',
          '&:hover': {
            backgroundColor: '#e9d5ff',
            color: '#752C84',
          },
        }),
      }}
      classNames={{
        control: (state) => 
          cn(
            'border rounded-md bg-white shadow-none transition-colors',
            state.isFocused ? '!border-purple-500 !shadow-purple-200' : 'hover:border-gray-400'
          ),
        option: (state) =>
          cn(
            'px-3 py-2 cursor-pointer transition-colors',
            state.isSelected 
              ? '!bg-purple-500 !text-white' 
              : state.isFocused 
                ? '!bg-purple-50 !text-purple-700' 
                : 'text-gray-900'
          ),
      }}
      options={options}
      isMulti={isMulti}
      // @ts-ignore
      value={isMulti ? multiValue(value) : [defaultValue(value)]}
      onChange={onChange}
      classNamePrefix="react-select"
      {...rest}
    />
  );
};

export { CustomSelect };
