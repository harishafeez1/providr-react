import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  totalStars?: number;
  initialRating?: number;
  onRatingChange?: (rating: number) => void;
  size?: number;
  className?: string;
  isDisabled?: boolean; // 🚫 New prop to disable interactions
}

const StarRating: React.FC<StarRatingProps> = ({
  totalStars = 5,
  initialRating = 0,
  onRatingChange,
  size = 24,
  className = '',
  isDisabled = false
}) => {
  const [rating, setRating] = useState(Math.round(initialRating));
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDisabled) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const starWidth = rect.width / totalStars;
    const newRating = Math.min(totalStars, Math.max(0, clickX / starWidth));
    const roundedRating = Math.round(newRating);
    setRating(roundedRating);
    if (onRatingChange) onRatingChange(roundedRating);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDisabled) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const hoverX = e.clientX - rect.left;
    const starWidth = rect.width / totalStars;
    const newHoverRating = Math.min(totalStars, Math.max(0, hoverX / starWidth));
    setHoverRating(Math.round(newHoverRating));
  };

  const handleMouseLeave = () => {
    if (isDisabled) return;
    setHoverRating(null);
  };

  const activeRating = hoverRating !== null ? hoverRating : rating;

  return (
    <div
      className={`flex space-x-1 ${className}`}
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ width: `${size * totalStars + (totalStars - 1) * 4}px` }}
    >
      {Array.from({ length: totalStars }, (_, index) => {
        const starValue = index + 1;
        const isFilled = activeRating >= starValue;

        return (
          <div key={index} className="focus:outline-none">
            <Star
              size={size}
              strokeWidth={1}
              fill={isFilled ? '#FFD700' : 'none'}
              stroke={isFilled ? '#FFD700' : 'gray'}
              className="transition-all duration-200"
            />
          </div>
        );
      })}
    </div>
  );
};

export { StarRating };

// import React, { useState } from 'react';
// import { Star, StarHalf } from 'lucide-react';

// // Define props for reusability and type safety
// interface StarRatingProps {
//   totalStars?: number; // Number of stars (default: 5)
//   initialRating?: number; // Initial rating value (default: 0)
//   onRatingChange?: (rating: number) => void; // Callback when rating changes
//   size?: number; // Size of the stars in pixels (default: 24)
//   className?: string; // Additional Tailwind classes for the container
// }

// // Utility to determine if a star should be full, half, or empty
// const getStarType = (starIndex: number, rating: number): 'full' | 'half' | 'empty' => {
//   const starValue = starIndex + 1;
//   if (rating >= starValue) return 'full'; // Fully filled
//   if (rating > starIndex && rating < starValue) return 'half'; // Half filled
//   return 'empty'; // Empty
// };

// const StarRating: React.FC<StarRatingProps> = ({
//   totalStars = 5,
//   initialRating = 0,
//   onRatingChange,
//   size = 24,
//   className = ''
// }) => {
//   const [rating, setRating] = useState(Math.round(initialRating * 2) / 2); // Round to nearest 0.5
//   const [hoverRating, setHoverRating] = useState<number | null>(null);

//   // Handle click to set rating in 0.5 increments
//   const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
//     const rect = e.currentTarget.getBoundingClientRect();
//     const clickX = e.clientX - rect.left;
//     const starWidth = rect.width / totalStars;
//     const newRating = Math.min(totalStars, Math.max(0, clickX / starWidth));
//     const roundedRating = Math.round(newRating * 2) / 2; // Snap to 0.5 increments
//     setRating(roundedRating);
//     if (onRatingChange) onRatingChange(roundedRating);
//   };

//   // Handle hover to preview rating in 0.5 increments
//   const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
//     const rect = e.currentTarget.getBoundingClientRect();
//     const hoverX = e.clientX - rect.left;
//     const starWidth = rect.width / totalStars;
//     const newHoverRating = Math.min(totalStars, Math.max(0, hoverX / starWidth));
//     setHoverRating(Math.round(newHoverRating * 2) / 2); // Snap to 0.5 increments
//   };

//   // Reset hover state when leaving the container
//   const handleMouseLeave = () => {
//     setHoverRating(null);
//   };

//   // Determine active rating (hover takes precedence over static rating)
//   const activeRating = hoverRating !== null ? hoverRating : rating;

//   return (
//     <div
//       className={`flex space-x-1 cursor-pointer ${className}`}
//       onClick={handleClick}
//       onMouseMove={handleMouseMove}
//       onMouseLeave={handleMouseLeave}
//       style={{ width: `${size * totalStars + (totalStars - 1) * 4}px` }} // Adjust for space-x-1 (4px gap)
//     >
//       {Array.from({ length: totalStars }, (_, index) => {
//         const starValue = index + 1;
//         const starType = getStarType(index, activeRating);

//         return (
//           <div key={index} className="focus:outline-none cursor-pointer">
//             {starType === 'full' ? (
//               <Star
//                 size={size}
//                 fill="#FFD700" // Golden color
//                 stroke="#FFD700"
//                 className="transition-all duration-200"
//               />
//             ) : starType === 'half' ? (
//               <StarHalf
//                 size={size}
//                 fill="#FFD700" // Golden color
//                 stroke="#FFD700"
//                 className="transition-all duration-200"
//               />
//             ) : (
//               <Star size={size} fill="none" stroke="gray" className="transition-all duration-200" />
//             )}
//           </div>
//         );
//       })}
//     </div>
//   );
// };

// export { StarRating };
