import { api } from '../app/utils/api.js';

export class BookmarkManager {
  async addBookmark(token, item) {
    try {
      // Map frontend fields (id, type) to Supabase fields (title, etc. if needed)
      // For now, we just pass the basic data through the API
      const result = await api.bookmarks.add({
        title: item.title || `Saved ${item.type}`,
        item_id: item.id.toString(),
        item_type: item.type,
        description: item.description || ""
      });
      return result;
    } catch (error) {
      console.error('Error adding bookmark:', error);
      return null;
    }
  }

  async removeBookmark(token, id) {
    try {
      const result = await api.bookmarks.remove(id);
      return result.success;
    } catch (error) {
      console.error('Error removing bookmark:', error);
      return false;
    }
  }

  async getBookmarks(token) {
    try {
      const data = await api.bookmarks.list();
      // Map Supabase fields back to what the UI expects (resource_id, etc.)
      return data.map(item => ({
        ...item,
        resource_id: parseInt(item.item_id) || item.item_id
      }));
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
      return [];
    }
  }
}

export const bookmarkManager = new BookmarkManager();

