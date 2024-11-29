import React from 'react';
import { UseFormRegister, FieldErrors } from 'react-hook-form';

interface PersonalInfoTabProps {
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
}

export default function PersonalInfoTab({ register, errors }: PersonalInfoTabProps) {
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="fullName" className="block text-sm font-medium text-gray-300 mb-1">
          Full Name
        </label>
        <input
          {...register('personalInfo.fullName')}
          type="text"
          className="w-full px-3 py-2 rounded-md bg-gaming-dark border border-gaming-neon/20 text-white focus:outline-none focus:border-gaming-neon"
        />
      </div>

      <div>
        <label htmlFor="age" className="block text-sm font-medium text-gray-300 mb-1">
          Age
        </label>
        <input
          {...register('personalInfo.age', { valueAsNumber: true })}
          type="number"
          min="13"
          className="w-full px-3 py-2 rounded-md bg-gaming-dark border border-gaming-neon/20 text-white focus:outline-none focus:border-gaming-neon"
        />
      </div>

      <div>
        <label htmlFor="gender" className="block text-sm font-medium text-gray-300 mb-1">
          Gender
        </label>
        <input
          {...register('personalInfo.gender')}
          type="text"
          className="w-full px-3 py-2 rounded-md bg-gaming-dark border border-gaming-neon/20 text-white focus:outline-none focus:border-gaming-neon"
        />
      </div>

      <div>
        <label htmlFor="location" className="block text-sm font-medium text-gray-300 mb-1">
          Location
        </label>
        <input
          {...register('personalInfo.location')}
          type="text"
          className="w-full px-3 py-2 rounded-md bg-gaming-dark border border-gaming-neon/20 text-white focus:outline-none focus:border-gaming-neon"
        />
      </div>

      <div>
        <label htmlFor="profession" className="block text-sm font-medium text-gray-300 mb-1">
          Profession
        </label>
        <input
          {...register('personalInfo.profession')}
          type="text"
          className="w-full px-3 py-2 rounded-md bg-gaming-dark border border-gaming-neon/20 text-white focus:outline-none focus:border-gaming-neon"
        />
      </div>
    </div>
  );
}