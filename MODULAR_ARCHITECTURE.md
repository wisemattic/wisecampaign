# WiseCampaign Modular Architecture Instruction

This plugin now follows a modular architecture for new feature development. This allows for independent development, testing, and deployment of features without affecting the core plugin or other modules.

## How it Works

1.  **Module Directory**: Each module lives in `modules/[module-name]/`.
2.  **Frontend**: Modules are built using **Vite**, **React**, and **Tailwind CSS**.
3.  **PHP Integration**: Modules are managed by the `WISECAMPAIGN\Classes\Modular\ModuleManager` class.

## Adding a New Module

To add a new module (e.g., `wiseDiscount`):

### 1. Create the Module Folder
Create a folder in `modules/wise-discount/` and initialize a React/Vite project.
Ensure `vite.config.js` has `manifest: true` set in the build options.

### 2. Register the Module in PHP
In `wisecampaign.php`, register the module using the `ModuleManager`:

```php
$module_manager = \WISECAMPAIGN\Classes\Modular\ModuleManager::get_instance();
$module_manager->register_module('wise-discount', [
    'name' => 'wiseDiscount',
    'menu_slug' => 'wise_discount'
]);
```

### 3. Add to Menu
In `includes/Classes/Menu.php`, add the submenu item:

```php
add_submenu_page(
    'wisecampaign_menu',
    'wiseDiscount',
    'wiseDiscount',
    'manage_options',
    'wise_discount',
    function() {
        echo '<div id="wise-discount-app"></div>';
    }
);
```

### 4. Build Assets
Run `npm run build` inside your module directory to generate the `dist/` folder and `manifest.json`. The `ModuleManager` will automatically detect these assets and enqueue them only on the specific admin page.

## Development Mode
If `WP_DEBUG` is enabled and no `manifest.json` is found, the `ModuleManager` will attempt to load assets from `http://localhost:5173/`. This allows for Hot Module Replacement (HMR) during development.

1.  Run `npm run dev` in the module directory.
2.  Open the WordPress admin page for the module.
3.  Changes in React will be reflected instantly.

## Security & Best Practices
- Always use the `moduleId` provided in `wiseModuleData` (available in JS via `window.wiseModuleData`) for API requests.
- Namespace your Tailwind classes if necessary to avoid conflicts, though the modular architecture minimizes this risk.
