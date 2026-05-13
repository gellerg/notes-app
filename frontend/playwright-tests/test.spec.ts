import { test, expect, type APIRequestContext } from '@playwright/test';

const API_URL = 'http://localhost:3001/notes';

type CreatedNote = {
  _id: string;
  title: string;
  content: string;
  author: {
    name: string;
    email: string;
  } | null;
};

const createNote = async (
  request: APIRequestContext,
  content = 'Seed note for test'
): Promise<CreatedNote> => {
  const response = await request.post(API_URL, {
    data: {
      title: 'test note',
      author: {
        name: 'Test Author',
        email: 'test@example.com',
      },
      content,
    },
  });

  expect(response.ok()).toBeTruthy();

  return (await response.json()) as CreatedNote;
};

test.describe('Notes CRUD flow', () => {
  test('reads notes from the page', async ({ page, request }) => {
    const note = await createNote(request, 'Read test note');

    await page.goto('/');

    await expect(page.getByRole('heading', { name: 'Fun Facts' })).toBeVisible();

    const createdNote = page.getByTestId(note._id);
    await expect(createdNote).toBeVisible();
    await expect(createdNote).toContainText('Read test note');
    await expect(page.locator('.note').first()).toBeVisible();
  });

  test('creates a new note', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: 'Add new note' }).click();

    const newNoteInput = page.locator('[name="text_input_new_note"]');
    await expect(newNoteInput).toBeVisible();

    await newNoteInput.fill('Playwright created note');
    await page.locator('[name="text_input_save_new_note"]').click();

    await expect(page.locator('.notification')).toHaveText('Added a new note');

    await expect(
      page.locator('.note').filter({ hasText: 'Playwright created note' }).first()
    ).toBeVisible();
  });

  test('updates a note', async ({ page, request }) => {
    const note = await createNote(request, 'Original note before update');

    await page.goto('/');

    const noteElement = page.getByTestId(note._id);
    await expect(noteElement).toBeVisible();

    await page.getByTestId(`edit-${note._id}`).click();

    const textarea = page.getByTestId(`text_input-${note._id}`);
    await expect(textarea).toBeVisible();

    await textarea.fill('Playwright updated note');
    await page.getByTestId(`text_input_save-${note._id}`).click();

    await expect(page.locator('.notification')).toHaveText('Note updated');

    await expect(noteElement).toBeVisible();
    await expect(noteElement).toContainText('Playwright updated note');
  });

  test('deletes a note', async ({ page, request }) => {
    const note = await createNote(request, 'Note to delete');

    await page.goto('/');

    const noteElement = page.getByTestId(note._id);
    await expect(noteElement).toBeVisible();

    await page.getByTestId(`delete-${note._id}`).click();

    await expect(page.locator('.notification')).toHaveText('Note deleted');
    await expect(page.getByTestId(note._id)).toHaveCount(0);
  });
});