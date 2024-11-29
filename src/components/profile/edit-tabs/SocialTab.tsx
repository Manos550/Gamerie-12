import React from 'react';
import { UseFormRegister, Control, useFieldArray } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';

interface SocialTabProps {
  register: UseFormRegister<any>;
  control: Control<any>;
}

export default function SocialTab({ register, control }: SocialTabProps) {
  const {
    fields: socialFields,
    append: appendSocial,
    remove: removeSocial
  } = useFieldArray({
    control,
    name: 'socialMedia'
  });

  const {
    fields: gamingFields,
    append: appendGaming,
    remove: removeGaming
  } = useFieldArray({
    control,
    name: 'gamingAccounts'
  });

  return (
    <div className="space-y-6">
      {/* Social Media Accounts */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-white">Social Media</h3>
          <button
            type="button"
            onClick={() => appendSocial({ platform: '', username: '', url: '' })}
            className="flex items-center gap-2 px-3 py-1 bg-gaming-neon/10 text-gaming-neon rounded-md hover:bg-gaming-neon/20"
          >
            <Plus className="w-4 h-4" />
            Add Social Media
          </button>
        </div>

        <div className="space-y-4">
          {socialFields.map((field, index) => (
            <div key={field.id} className="flex gap-4">
              <div className="flex-1 space-y-4">
                <input
                  {...register(`socialMedia.${index}.platform`)}
                  placeholder="Platform (e.g., Twitter)"
                  className="w-full px-3 py-2 rounded-md bg-gaming-dark border border-gaming-neon/20 text-white focus:outline-none focus:border-gaming-neon"
                />
                <input
                  {...register(`socialMedia.${index}.username`)}
                  placeholder="Username"
                  className="w-full px-3 py-2 rounded-md bg-gaming-dark border border-gaming-neon/20 text-white focus:outline-none focus:border-gaming-neon"
                />
                <input
                  {...register(`socialMedia.${index}.url`)}
                  placeholder="Profile URL"
                  className="w-full px-3 py-2 rounded-md bg-gaming-dark border border-gaming-neon/20 text-white focus:outline-none focus:border-gaming-neon"
                />
              </div>
              <button
                type="button"
                onClick={() => removeSocial(index)}
                className="p-2 h-fit text-gaming-accent hover:bg-gaming-accent/10 rounded-full"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Gaming Accounts */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-white">Gaming Accounts</h3>
          <button
            type="button"
            onClick={() => appendGaming({ platform: '', username: '', url: '' })}
            className="flex items-center gap-2 px-3 py-1 bg-gaming-neon/10 text-gaming-neon rounded-md hover:bg-gaming-neon/20"
          >
            <Plus className="w-4 h-4" />
            Add Gaming Account
          </button>
        </div>

        <div className="space-y-4">
          {gamingFields.map((field, index) => (
            <div key={field.id} className="flex gap-4">
              <div className="flex-1 space-y-4">
                <input
                  {...register(`gamingAccounts.${index}.platform`)}
                  placeholder="Platform (e.g., Steam)"
                  className="w-full px-3 py-2 rounded-md bg-gaming-dark border border-gaming-neon/20 text-white focus:outline-none focus:border-gaming-neon"
                />
                <input
                  {...register(`gamingAccounts.${index}.username`)}
                  placeholder="Username"
                  className="w-full px-3 py-2 rounded-md bg-gaming-dark border border-gaming-neon/20 text-white focus:outline-none focus:border-gaming-neon"
                />
                <input
                  {...register(`gamingAccounts.${index}.url`)}
                  placeholder="Profile URL (optional)"
                  className="w-full px-3 py-2 rounded-md bg-gaming-dark border border-gaming-neon/20 text-white focus:outline-none focus:border-gaming-neon"
                />
              </div>
              <button
                type="button"
                onClick={() => removeGaming(index)}
                className="p-2 h-fit text-gaming-accent hover:bg-gaming-accent/10 rounded-full"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}