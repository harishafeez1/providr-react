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
      classNames={{}}
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
