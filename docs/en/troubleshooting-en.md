# Troubleshooting

Common issues and their solutions.

## pandoc Not Found

### Symptom

```
Error: pandoc not found
```

### Solution

1. Install pandoc using your package manager:

```bash
# macOS
brew install pandoc

# Ubuntu/Debian
sudo apt install pandoc

# Windows
choco install pandoc
```

2. Verify installation:

```bash
pandoc --version
```

3. Restart your terminal

### If Still Not Working

- Check if pandoc is in your PATH
- Try running `which pandoc` (macOS/Linux) or `where pandoc` (Windows)
- Reinstall pandoc

## Port Already in Use

### Symptom

```
Error: EADDRINUSE: address already in use :::38080
```

### Solution

#### Option 1: Use vimd kill (Recommended)

Since v0.2.1, you can terminate running sessions with the `vimd kill` command.

```bash
# Terminate all sessions
vimd kill

# Terminate session on specific port
vimd kill --port 38080
```

#### Option 2: Use a different port

```bash
vimd dev document.md --port 3000
```

#### Option 3: Find and kill the process using the port

```bash
# macOS/Linux
lsof -i :38080
kill -9 <PID>

# Windows
netstat -ano | findstr :38080
taskkill /PID <PID> /F
```

#### Option 4: Change default port in config

```javascript
// ~/.vimd/config.js
export default {
  port: 3000,
  // ...
};
```

## Theme Not Applied

### Symptom

Preview shows unstyled HTML or wrong theme.

### Solution

1. Check available themes:

```bash
vimd theme
```

2. Verify your configuration:

```bash
vimd config --list
```

3. Try specifying theme explicitly:

```bash
vimd dev document.md --theme github
```

4. If using source installation, rebuild:

```bash
npm run build
```

## Live Reload Not Working

### Symptom

Browser doesn't refresh when file is saved.

### Solution

1. Check if the file is being watched:
   - Make sure you're editing the file specified in the command
   - Files in `node_modules` and `.git` are ignored by default

2. Check browser console for errors

3. Try restarting the server:
   - Press `Ctrl+C` to stop
   - Run `vimd dev` again

4. Check firewall settings:
   - Allow Node.js through firewall
   - Allow connections to localhost

## Images Not Displaying

### Symptom

Images show as broken in preview.

### Solution

1. Use relative paths from the Markdown file location:

```markdown
![Image](./images/photo.png)
```

2. For absolute paths, use file:// protocol:

```markdown
![Image](file:///path/to/image.png)
```

3. Make sure the image file exists at the specified path

## Configuration Not Loading

### Symptom

Custom settings are ignored.

### Solution

1. Check config file location:

```bash
vimd config --list
```

2. Verify syntax of `~/.vimd/config.js`:

```javascript
// Correct format
export default {
  theme: 'github',
  port: 38080,  // Default: 38080
};
```

3. Check for syntax errors:

```bash
node ~/.vimd/config.js
```

## High CPU Usage

### Symptom

Node.js process using excessive CPU.

### Solution

1. Check if many files are being watched:
   - Exclude large directories in config

```javascript
// ~/.vimd/config.js
export default {
  watch: {
    ignored: ['node_modules', '.git', 'dist', 'build'],
  },
};
```

2. Close other vimd instances:

```bash
# Recommended: Use vimd kill command
vimd kill

# Or use pkill
pkill -f vimd
```

## Getting Help

If these solutions don't work:

1. Check [GitHub Issues](https://github.com/notokeisho/vimd/issues)
2. Create a new issue with:
   - vimd version (`vimd --version`)
   - Node.js version (`node --version`)
   - pandoc version (`pandoc --version`)
   - Operating system
   - Steps to reproduce
