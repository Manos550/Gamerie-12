import React from 'react';
import { SocialMedia, GamingAccount } from '../../types';
import { ExternalLink, Gamepad } from 'lucide-react';

interface SocialLinksProps {
  socialMedia: SocialMedia[];
  gamingAccounts: GamingAccount[];
}

export default function SocialLinks({ socialMedia, gamingAccounts }: SocialLinksProps) {
  return (
    <div className="space-y-6">
      {/* Social Media */}
      <div className="bg-gaming-card rounded-lg border border-gaming-neon/20 p-6">
        <h2 className="font-display text-xl font-bold text-white mb-4">
          Social Media
        </h2>

        <div className="grid gap-3">
          {socialMedia.map((account) => (
            <a
              key={account.platform}
              href={account.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 rounded-lg bg-gaming-dark/50 hover:bg-gaming-dark group transition-colors"
            >
              <div className="flex items-center gap-3">
                <img
                  src={`https://api.iconify.design/simple-icons/${account.platform.toLowerCase()}.svg`}
                  alt={account.platform}
                  className="w-5 h-5"
                />
                <span className="text-gray-400 group-hover:text-white">
                  {account.username}
                </span>
              </div>
              <ExternalLink className="w-4 h-4 text-gaming-neon" />
            </a>
          ))}
        </div>
      </div>

      {/* Gaming Accounts */}
      <div className="bg-gaming-card rounded-lg border border-gaming-neon/20 p-6">
        <h2 className="font-display text-xl font-bold text-white mb-4">
          Gaming Accounts
        </h2>

        <div className="grid gap-3">
          {gamingAccounts.map((account) => (
            <div
              key={account.platform}
              className="flex items-center justify-between p-3 rounded-lg bg-gaming-dark/50"
            >
              <div className="flex items-center gap-3">
                <Gamepad className="w-5 h-5 text-gaming-neon" />
                <div>
                  <div className="text-white">{account.platform}</div>
                  <div className="text-sm text-gray-400">{account.username}</div>
                </div>
              </div>
              {account.url && (
                <a
                  href={account.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gaming-neon hover:text-gaming-neon/80"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}