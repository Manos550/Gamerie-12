import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import NewsPost from '../NewsPost';
import { useAuthStore } from '../../../lib/store';

// Mock the store
vi.mock('../../../lib/store', () => ({
  useAuthStore: vi.fn()
}));

// Mock the news functions
vi.mock('../../../lib/news', () => ({
  likePost: vi.fn(),
  savePost: vi.fn()
}));

describe('NewsPost', () => {
  const mockPost = {
    id: '1',
    authorId: 'author1',
    authorName: 'Test Author',
    authorImage: 'https://example.com/image.jpg',
    title: 'Test Post',
    content: 'Test content',
    media: [],
    likes: [],
    saves: [],
    comments: [],
    tags: ['gaming', 'esports'],
    createdAt: new Date(),
    updatedAt: new Date()
  };

  it('renders post content correctly', () => {
    useAuthStore.mockReturnValue({ user: null });

    render(
      <BrowserRouter>
        <NewsPost post={mockPost} />
      </BrowserRouter>
    );

    expect(screen.getByText('Test Post')).toBeInTheDocument();
    expect(screen.getByText('Test content')).toBeInTheDocument();
    expect(screen.getByText('Test Author')).toBeInTheDocument();
  });

  it('handles like interaction when user is logged in', async () => {
    useAuthStore.mockReturnValue({
      user: { id: 'user1', username: 'testuser' }
    });

    render(
      <BrowserRouter>
        <NewsPost post={mockPost} />
      </BrowserRouter>
    );

    const likeButton = screen.getByRole('button', { name: /0/i });
    await fireEvent.click(likeButton);

    expect(likeButton).toBeInTheDocument();
  });

  it('displays tags correctly', () => {
    useAuthStore.mockReturnValue({ user: null });

    render(
      <BrowserRouter>
        <NewsPost post={mockPost} />
      </BrowserRouter>
    );

    expect(screen.getByText('#gaming')).toBeInTheDocument();
    expect(screen.getByText('#esports')).toBeInTheDocument();
  });
});