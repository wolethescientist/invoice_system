# Fix CSS Lint Warnings in VS Code

The CSS lint warnings you're seeing for `@tailwind` and `@apply` directives are false positives. These are valid Tailwind CSS directives that work perfectly fine.

## Quick Fix

Add these settings to your VS Code workspace or user settings:

### Option 1: Workspace Settings (Recommended)
1. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
2. Type "Preferences: Open Workspace Settings (JSON)"
3. Add these lines:

```json
{
  "css.lint.unknownAtRules": "ignore",
  "scss.lint.unknownAtRules": "ignore",
  "tailwindCSS.experimental.classRegex": [
    ["cn\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"]
  ],
  "files.associations": {
    "*.css": "tailwindcss"
  }
}
```

### Option 2: User Settings (Global)
1. Press `Ctrl+,` (or `Cmd+,` on Mac) to open Settings
2. Search for "css lint unknown"
3. Set "CSS > Lint: Unknown At Rules" to "ignore"
4. Search for "scss lint unknown"
5. Set "SCSS > Lint: Unknown At Rules" to "ignore"

### Option 3: Install Tailwind CSS IntelliSense Extension
1. Open VS Code Extensions (`Ctrl+Shift+X`)
2. Search for "Tailwind CSS IntelliSense"
3. Install the official extension by Tailwind Labs
4. Reload VS Code

This extension provides:
- Autocomplete for Tailwind classes
- Linting for Tailwind directives
- Hover previews
- Syntax highlighting

## Why These Warnings Appear

The default CSS linter doesn't recognize Tailwind's special directives:
- `@tailwind` - Injects Tailwind's base, components, and utilities
- `@apply` - Applies Tailwind utility classes in CSS
- `@layer` - Defines custom CSS layers

These are processed by PostCSS and Tailwind during build time, so they're completely valid.

## Verify It's Working

After applying the settings:
1. Reload VS Code window (`Ctrl+Shift+P` → "Developer: Reload Window")
2. Open `frontend/src/app/globals.css`
3. The warnings should be gone

## Alternative: Suppress in File

If you prefer to keep the linter active but suppress warnings in specific files, add this at the top of `globals.css`:

```css
/* stylelint-disable */
@tailwind base;
@tailwind components;
@tailwind utilities;
/* stylelint-enable */
```

---

**Note**: These are cosmetic warnings only. Your code compiles and runs perfectly fine regardless of these warnings.
