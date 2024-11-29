import React from 'react';
import { UseFormRegister, Control, useFieldArray } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';
import { Platform } from '../../../types';

interface SkillsTabProps {
  register: UseFormRegister<any>;
  control: Control<any>;
}

export default function SkillsTab({ register, control }: SkillsTabProps) {
  const {
    fields: skillFields,
    append: appendSkill,
    remove: removeSkill
  } = useFieldArray({
    control,
    name: 'skills'
  });

  return (
    <div className="space-y-6">
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-white">Gaming Skills</h3>
          <button
            type="button"
            onClick={() => appendSkill({ name: '', endorsements: [] })}
            className="flex items-center gap-2 px-3 py-1 bg-gaming-neon/10 text-gaming-neon rounded-md hover:bg-gaming-neon/20"
          >
            <Plus className="w-4 h-4" />
            Add Skill
          </button>
        </div>

        <div className="space-y-4">
          {skillFields.map((field, index) => (
            <div key={field.id} className="flex items-center gap-4">
              <input
                {...register(`skills.${index}.name`)}
                placeholder="Enter skill name"
                className="flex-1 px-3 py-2 rounded-md bg-gaming-dark border border-gaming-neon/20 text-white focus:outline-none focus:border-gaming-neon"
              />
              <button
                type="button"
                onClick={() => removeSkill(index)}
                className="p-2 text-gaming-accent hover:bg-gaming-accent/10 rounded-full"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-white mb-4">Platforms</h3>
        <div className="grid grid-cols-2 gap-2">
          {(['PC', 'XBOX', 'PS5', 'Switch', 'Mobile'] as Platform[]).map((platform) => (
            <label
              key={platform}
              className="flex items-center gap-2 p-2 rounded-lg bg-gaming-dark/50 cursor-pointer"
            >
              <input
                type="checkbox"
                value={platform}
                {...register('platforms')}
                className="rounded border-gaming-neon/20 text-gaming-neon focus:ring-gaming-neon bg-gaming-dark"
              />
              <span className="text-white">{platform}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}