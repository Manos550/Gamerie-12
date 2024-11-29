import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CreateNewsPost from '../CreateNewsPost';
import { useAuthStore } from '../../../lib/store';

// Mock the store
vi.mock('../../../lib/store', () => ({
  useAuthStore: vi.fn()
}));

// Mock the news functions
vi.mock('../../../lib/news', () => ({
  createNewsPost: vi.fn()
}));

describe('CreateNewsPost', () => {
  const mockUser = {
    id: 'user1',
    username: 'testuser',
    profileImage: 'https://example.com/image.jpg'
  };

  beforeEach(() => {
    useAuthStore.mockReturnValue({ user: mockUser });
  });

  it('renders form elements correctly', () => {
    render(<CreateNewsPost />);

    expect(screen.getByPlaceholderText('Post title...')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Share your gaming news and updates...')).toBeInTheDocument();
    expect(screen.getByText('Add Media')).toBeInTheDocument();
  });

  it('handles tag input correctly', async () => {
    render(<CreateNewsPost />);

    const tagInput = screen.getByPlaceholderText('Add tags...');
    await userEvent.type(tagInput, 'gaming{enter}');

    expect(screen.getByText('#gaming')).toBeInTheDocument();
  });

  it('handles form submission', async () => {
    const { createNewsPost } = await import('../../../lib/news');
    render(<CreateNewsPost />);

    await userEvent.type(screen.getByPlaceholderText('Post title...'), 'Test Title');
    await userEvent.type(screen.getByPlaceholderText('Share your gaming news and updates...'), 'Test Content');
    
    const submitButton = screen.getByRole('button', { name: /post/i });
    await fireEvent.click(submitButton);

    await waitFor(() => {
      expect(createNewsPost).toHaveBeenCalled();
    });
  });

  it('validates required fields', async () => {
    render(<CreateNewsPost />);

    const submitButton = screen.getByRole('button', { name: /post/i });
    await fireEvent.click(submitButton);

    expect(await screen.findByText('Title is required')).toBeInTheDocument();
    expect(await screen.findByText('Content is required')).toBeInTheDocument();
  });
});