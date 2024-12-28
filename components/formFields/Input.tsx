interface FormProps {
  label: string;
  placeholder: string;
  value: any;
  type: string;

  onChange: (name: string, value: any) => void;
  name: string;
}
export const FormField: React.FC<FormProps> = ({
  label,
  placeholder,
  value,
  onChange,
  name,
  type,
}) => (
  <div className="mb-6">
    <label className="text-sm text-gray-600 mb-2 block">{label}</label>
    <input
      type={type}
      className="w-full px-4 py-3 bg-gray-50/50 border border-gray-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(name, e.target.value)}
    />
  </div>
);
