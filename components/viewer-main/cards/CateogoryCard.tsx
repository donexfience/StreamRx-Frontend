interface CategoryProps {
  title: string;
  viewers: number;
  followers: number;
  image: string;
}

export const CategoryCard: React.FC<CategoryProps> = ({
  title,
  viewers,
  followers,
  image,
}) => (
  <div className="relative flex flex-col w-48 rounded-lg overflow-hidden group cursor-pointer">
    <img
      src={image || "/api/placeholder/200/250"}
      alt={title}
      className="w-full h-32 object-cover"
    />
    <div className="p-2 bg-gray-800">
      <h3 className="text-white font-medium">{title}</h3>
      <div className="flex items-center space-x-4 text-gray-400 text-sm">
        <span>{followers}K</span>
        <span>{viewers}M</span>
      </div>
    </div>
  </div>
);
