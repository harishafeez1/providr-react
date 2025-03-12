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
  const getValue = () => {
    if (!value) return isMulti ? [] : null;
    return isMulti
      ? (value as any[]).map((val) => options.find((option: any) => option.value === val))
      : options.find((option: any) => option.value === value);
  };

  return (
    <Select<Option, IsMulti, GroupBase<Option>>
      className={cn('w-full text-[13px] font-medium', className)}
      classNames={{}}
      options={options}
      isMulti={isMulti}
      // @ts-ignore
      value={getValue()}
      onChange={onChange}
      classNamePrefix="react-select"
      {...rest}
    />
  );
};

export { CustomSelect };
