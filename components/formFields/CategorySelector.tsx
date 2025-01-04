import React, { useState } from "react";
import { X } from "lucide-react";
import { FormErrors } from "../modals/StreamerRequset";

interface CategoryTagProps {
  category: string;
  onRemove: () => void;
}

const CategoryTag: React.FC<CategoryTagProps> = ({ category, onRemove }) => (
  <div className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-800 rounded-full">
    <span>{category}</span>
    <button
      onClick={onRemove}
      className="hover:bg-gray-200 rounded-full p-0.5"
      aria-label={`Remove ${category}`}
    >
      <X size={14} />
    </button>
  </div>
);

interface CategorySelectorProps {
  selectedCategories: any;
  onCategoryChange: (categories: string[]) => void;
  errors?: FormErrors;
  setErrors: any;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({
  selectedCategories,
  onCategoryChange,
  errors,
  setErrors,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const categories = [
    "Gaming",
    "IRL",
    "Music",
    "Creative",
    "Art",
    "Just Chatting",
    "Sports",
    "Education",
    "Technology",
    "Cooking",
    "Travel",
    "Fitness",
    "Dance",
    "Photography",
    "Podcasting",
    "Fashion",
    "Beauty",
    "Business",
  ];

  const handleCategorySelect = (category: string) => {
    if (categories.length > 0) {
      setErrors((prevErrors: any) => ({ ...prevErrors, category: undefined }));
    }
    if (!selectedCategories.includes(category)) {
      onCategoryChange([...selectedCategories, category]);
    }
    setIsOpen(false);
  };

  const handleRemoveCategory = (categoryToRemove: string) => {
    onCategoryChange(
      selectedCategories.filter((cat: any) => cat !== categoryToRemove)
    );
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Categories
      </label>

      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-4 py-2 text-left border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          Select categories...
        </button>
        {errors && (
          <p className="text-red-500 text-sm mt-1">{errors.category}</p>
        )}
        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            <div className="p-1">
              {categories
                .filter((cat) => !selectedCategories.includes(cat))
                .map((category) => (
                  <button
                    key={category}
                    onClick={() => handleCategorySelect(category)}
                    className="w-full px-3 py-2 text-left hover:bg-gray-50 rounded-lg"
                  >
                    {category}
                  </button>
                ))}
            </div>
          </div>
        )}
      </div>

      {selectedCategories.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {selectedCategories.map((category: any) => (
            <CategoryTag
              key={category}
              category={category}
              onRemove={() => handleRemoveCategory(category)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CategorySelector;
