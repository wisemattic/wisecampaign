import React, { useState, useMemo, useRef } from 'react';
import { 
  Laptop, 
  Smartphone, 
  Save, 
  Search, 
  RotateCcw, 
  ChevronDown, 
  ChevronUp, 
  ChevronRight,
  Eye, 
  EyeOff, 
  Sparkles,
  Grid,
  Check,
  ShoppingCart,
  Columns,
  Layers,
  ArrowUpDown,
  AlignLeft,
  Square,
  Undo,
  HelpCircle,
  Copy,
  TableProperties,
  Plus,
  GripVertical,
  X
} from 'lucide-react';

// Mock Product data (16 items)
const INITIAL_PRODUCTS = [
  {
    id: 1,
    name: 'Blue Polo',
    category: 'Apparel',
    color: 'Blue',
    size: 'M',
    price: 25.00,
    regularPrice: 25.00,
    summary: 'This is the product short description. You can choose which columns display in the table.',
    image: 'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?auto=format&fit=crop&q=80&w=100',
    inStock: true
  },
  {
    id: 2,
    name: 'Grey T-Shirt',
    category: 'Apparel',
    color: 'Grey',
    size: 'L',
    price: 15.00,
    regularPrice: 20.00,
    onSale: true,
    summary: 'This product is on sale. You can see the discounted price in the \'Price\' column.',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=100',
    inStock: true
  },
  {
    id: 3,
    name: "Men's Hoodie with Zipper",
    category: 'Apparel',
    color: 'Grey',
    size: 'XL',
    price: 18.00,
    regularPrice: 25.00,
    isVariable: true,
    summary: 'This is a variable product. You can list variations as dropdowns, or on individual rows in the table.',
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=100',
    inStock: true
  },
  {
    id: 4,
    name: 'Blue Woo Hoodie',
    category: 'Apparel',
    color: 'Blue',
    size: 'S',
    price: 45.00,
    regularPrice: 45.00,
    summary: 'This is the product short description. You can choose which columns display in the table.',
    image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=80&w=100',
    inStock: true
  },
  {
    id: 5,
    name: 'Grey Hoodie with Pockets',
    category: 'Apparel',
    color: 'Grey',
    size: 'M',
    price: 5.00,
    regularPrice: 5.00,
    isExternal: true,
    summary: 'This is an external/affiliate product. You can choose the button text and link to any URL or external website.',
    image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=80&w=100',
    inStock: true
  },
  {
    id: 6,
    name: 'Grey Woo T-Shirt',
    category: 'Apparel',
    color: 'Grey',
    size: 'M',
    price: 30.00,
    regularPrice: 30.00,
    summary: 'This is the product short description. You can choose which columns display in the table.',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=100',
    inStock: true
  },
  {
    id: 7,
    name: 'Woo Hoodie',
    category: 'Apparel',
    color: 'Blue',
    size: 'M',
    price: 40.00,
    regularPrice: 40.00,
    isVariable: true,
    summary: 'This is a variable product. You can list variations as dropdowns, or on individual rows in the table.',
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=100',
    inStock: true
  },
  {
    id: 8,
    name: 'Red Woo T-Shirt',
    category: 'Apparel',
    color: 'Red',
    size: 'L',
    price: 29.99,
    regularPrice: 29.99,
    summary: 'This is the product short description. You can choose which columns display in the table.',
    image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&q=80&w=100',
    inStock: true
  },
  {
    id: 9,
    name: 'White Woo T-Shirt',
    category: 'Apparel',
    color: 'White',
    size: 'M',
    price: 30.50,
    regularPrice: 30.50,
    summary: 'This is the product short description. You can choose which columns display in the table.',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=100',
    inStock: true
  },
  {
    id: 10,
    name: 'Woo CD #1',
    category: 'Music',
    color: 'N/A',
    size: 'N/A',
    price: 135.00,
    regularPrice: 135.00,
    summary: 'This is the product short description. You can choose which columns display in the table.',
    image: 'https://images.unsplash.com/photo-1539707132456-a3c49aa6027a?auto=format&fit=crop&q=80&w=100',
    inStock: true
  },
  {
    id: 11,
    name: 'Classic Sunglass',
    category: 'Accessories',
    color: 'Black',
    size: 'One Size',
    price: 15.00,
    regularPrice: 15.00,
    summary: 'Sleek classic design with polarized lenses for modern protection.',
    image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&q=80&w=100',
    inStock: true
  },
  {
    id: 12,
    name: 'Leather Belt',
    category: 'Accessories',
    color: 'Brown',
    size: 'L',
    price: 35.00,
    regularPrice: 35.00,
    summary: 'Genuine handcrafted premium leather belt with brass buckle details.',
    image: 'https://images.unsplash.com/photo-1624222247344-550fb8ecf7db?auto=format&fit=crop&q=80&w=100',
    inStock: true
  },
  {
    id: 13,
    name: 'Summer Cap',
    category: 'Accessories',
    color: 'White',
    size: 'M',
    price: 19.99,
    regularPrice: 24.99,
    onSale: true,
    summary: 'Breathable sports summer cap for protection and high performance.',
    image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&q=80&w=100',
    inStock: true
  },
  {
    id: 14,
    name: 'Running Shoes',
    category: 'Apparel',
    color: 'Blue',
    size: 'XL',
    price: 89.00,
    regularPrice: 99.00,
    summary: 'High performance running sneakers with shock absorption cushion.',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=100',
    inStock: true
  },
  {
    id: 15,
    name: 'Canvas Backpack',
    category: 'Accessories',
    color: 'Grey',
    size: 'M',
    price: 49.00,
    regularPrice: 49.00,
    summary: 'Spacious canvas backpack for day-to-day work, travel, and adventure.',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=100',
    inStock: true
  },
  {
    id: 16,
    name: 'Beanie Hat',
    category: 'Accessories',
    color: 'Red',
    size: 'S',
    price: 12.00,
    regularPrice: 12.00,
    summary: 'Warm woolen winter beanie hat for ultimate street style.',
    image: 'https://images.unsplash.com/photo-1576871337622-98d48d4aa53e?auto=format&fit=crop&q=80&w=100',
    inStock: false
  }
];

// Design Defaults
const DESIGN_DEFAULTS = {
  // Borders
  borderExternalColor: '#cbd5e1',
  borderExternalSize: '1',
  borderHeaderColor: '#cbd5e1',
  borderHeaderSize: '1',
  borderHorizontalColor: '#e2e8f0',
  borderHorizontalSize: '1',
  borderVerticalColor: '#e2e8f0',
  borderVerticalSize: '1',
  borderBottomColor: '#cbd5e1',
  borderBottomSize: '1',

  // Header backgrounds
  headerBgColor: '#f8fafc',
  cellBgColor: '#ffffff',

  // Fonts
  fontHeaderColor: '#1e293b',
  fontHeaderSize: '12',
  fontCellColor: '#475569',
  fontCellSize: '12',
  fontHyperlinkColor: '#2563eb',
  fontHyperlinkSize: '12',
  fontMainBtnColor: '#ffffff',
  fontMainBtnSize: '11',
  fontDisableBtnColor: '#ffffff',
  fontDisableBtnSize: '11',
  quantityFontColor: '#1e293b',
  quantityFontSize: '12',

  // Button backgrounds
  btnMainBgColor: '#0f172a',
  btnMainHoverBgColor: '#1e293b',
  btnDisableBgColor: '#94a3b8',
  quantityBgColor: '#f8fafc',

  // Search
  searchBgColor: '#ffffff',
  searchFontColor: '#334155',
  searchBorderColor: '#cbd5e1',
  searchBorderSize: '1',

  // Dropdowns
  dropdownBgColor: '#ffffff',
  dropdownFontColor: '#334155',
  dropdownBorderColor: '#cbd5e1',
  dropdownBorderSize: '1',

  // Checkboxes
  checkboxColor: '#2563eb',

  // Cell backgrounds style & corners
  cellBgStyle: 'alternate-rows', // 'no-alternate' | 'alternate-rows' | 'alternate-columns'
  cornerStyle: 'rounded' // 'theme-default' | 'square' | 'rounded' | 'fully-rounded'
};

// Default Columns Definition
const DEFAULT_COLUMNS = [
  { id: 'image', name: 'Image', badge: 'image', expanded: false, addLink: true, linkType: 'page', showHeading: true, width: '', widthUnit: '%', respVis: 'default' },
  { id: 'name', name: 'Name', badge: 'name', expanded: false, addLink: true, linkType: 'page', showHeading: true, width: '', widthUnit: '%', respVis: 'default' },
  { id: 'summary', name: 'Summary', badge: 'summary', expanded: false, addLink: false, linkType: 'page', showHeading: true, width: '', widthUnit: '%', respVis: 'default' },
  { id: 'price', name: 'Price', badge: 'price', expanded: false, addLink: false, linkType: 'page', showHeading: true, width: '', widthUnit: '%', respVis: 'default' },
  { id: 'buy', name: 'Buy', badge: 'buy', expanded: false, addLink: false, linkType: 'page', showHeading: true, width: '', widthUnit: '%', respVis: 'default' }
];

// Saved Tables Metadata List (matches user's requested layout perfectly!)
const SAVED_TABLES = [
  {
    name: 'Shop Pages',
    display: 'Template: Shop page, Product search results, Product categories, Product tags, Product attributes',
    shortcode: '',
    columns: DEFAULT_COLUMNS,
    cartMethod: 'Cart buttons',
    showQty: true,
    varMethod: 'Show as dropdown lists',
    lazyLoad: false,
    prodLimit: '500',
    showSearch: true,
    showFilters: true,
    sortBy: 'Default menu order',
    filter: (p) => true
  },
  {
    name: 'Quick Order Form - Accessories',
    display: 'Product categories: Accessories',
    shortcode: '[product_table id="5"]',
    columns: DEFAULT_COLUMNS,
    cartMethod: 'Cart buttons',
    showQty: true,
    varMethod: 'Show as dropdown lists',
    lazyLoad: false,
    prodLimit: '500',
    showSearch: true,
    showFilters: true,
    sortBy: 'Default menu order',
    filter: (p) => p.category === 'Accessories'
  },
  {
    name: 'Quick Order Form - Hoodies',
    display: 'Product categories: Hoodies',
    shortcode: '[product_table id="4"]',
    columns: DEFAULT_COLUMNS,
    cartMethod: 'Cart buttons',
    showQty: true,
    varMethod: 'Show as dropdown lists',
    lazyLoad: false,
    prodLimit: '500',
    showSearch: true,
    showFilters: true,
    sortBy: 'Default menu order',
    filter: (p) => p.category === 'Apparel' && p.name.includes('Hoodie')
  },
  {
    name: 'Quick Order Form - T-Shirts',
    display: 'Product categories: T-shirts',
    shortcode: '[product_table id="3"]',
    columns: DEFAULT_COLUMNS,
    cartMethod: 'Cart buttons',
    showQty: true,
    varMethod: 'Show as dropdown lists',
    lazyLoad: false,
    prodLimit: '500',
    showSearch: true,
    showFilters: true,
    sortBy: 'Default menu order',
    filter: (p) => p.category === 'Apparel' && p.name.toLowerCase().includes('shirt')
  }
];

export default function App() {
  // --- ADD TABLE WIZARD STATE ---
  const [savedTablesList, setSavedTablesList] = useState(SAVED_TABLES);
  const [isAddTableWizardOpen, setIsAddTableWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [wizardTableName, setWizardTableName] = useState('');
  const [wizardAddMethod, setWizardAddMethod] = useState('shortcode');
  const [wizardProductSource, setWizardProductSource] = useState('all');
  const [wizardCategory, setWizardCategory] = useState('Accessories');
  const [storeCategories, setStoreCategories] = useState([]);
  const [storeTags, setStoreTags] = useState([]);
  const [storeProducts, setStoreProducts] = useState([]);
  const [storeFields, setStoreFields] = useState([]);
  const [storeColors, setStoreColors] = useState([]);
  const [storeSizes, setStoreSizes] = useState([]);
  const [storeTypes, setStoreTypes] = useState([]);
  const [storeStatuses, setStoreStatuses] = useState([]);
  const [storeStocks, setStoreStocks] = useState([]);
  
  // Wizard filter toggle states
  const [wizardCatChecked, setWizardCatChecked] = useState(true);
  const [wizardTagChecked, setWizardTagChecked] = useState(false);
  const [wizardProdChecked, setWizardProdChecked] = useState(false);
  const [wizardFieldChecked, setWizardFieldChecked] = useState(false);
  const [wizardColorChecked, setWizardColorChecked] = useState(false);
  const [wizardSizeChecked, setWizardSizeChecked] = useState(false);
  const [wizardTypeChecked, setWizardTypeChecked] = useState(false);
  const [wizardStatusChecked, setWizardStatusChecked] = useState(false);
  const [wizardStockChecked, setWizardStockChecked] = useState(false);

  // Wizard active selection arrays
  const [wizardCategories, setWizardCategories] = useState(['Accessories']);
  const [wizardTags, setWizardTags] = useState(['Standard']);
  const [wizardProds, setWizardProds] = useState([]);
  const [wizardFields, setWizardFields] = useState(['_featured']);
  const [wizardColors, setWizardColors] = useState(['Black', 'Blue']);
  const [wizardSizes, setWizardSizes] = useState(['M', 'L']);
  const [wizardTypes, setWizardTypes] = useState(['simple', 'variable']);
  const [wizardStatuses, setWizardStatuses] = useState(['publish']);
  const [wizardStocks, setWizardStocks] = useState(['in_stock']);
  const [wizardColumns, setWizardColumns] = useState([
    { id: 'image', name: 'Image', badge: 'image', expanded: true, addLink: true, linkType: 'page', showHeading: true, width: '', widthUnit: '%', respVis: 'default', respPrio: '' },
    { id: 'name', name: 'Name', badge: 'name', expanded: false, addLink: true, linkType: 'page', showHeading: true, width: '', widthUnit: '%', respVis: 'default' },
    { id: 'summary', name: 'Summary', badge: 'summary', expanded: false, addLink: false, linkType: 'page', showHeading: true, width: '', widthUnit: '%', respVis: 'default' },
    { id: 'price', name: 'Price', badge: 'price', expanded: false, addLink: false, linkType: 'page', showHeading: true, width: '', widthUnit: '%', respVis: 'default' },
    { id: 'buy', name: 'Buy', badge: 'buy', expanded: false, addLink: false, linkType: 'page', showHeading: true, width: '', widthUnit: '%', respVis: 'default' }
  ]);
  const [wizardNewCol, setWizardNewCol] = useState('stock');
  const [wizardCartMethod, setWizardCartMethod] = useState('Cart buttons');
  const [wizardShowQty, setWizardShowQty] = useState(true);
  const [wizardVarMethod, setWizardVarMethod] = useState('Show as dropdown lists');
  const [wizardLazyLoad, setWizardLazyLoad] = useState(false);
  const [wizardProdLimit, setWizardProdLimit] = useState('500');
  const [wizardShowSearch, setWizardShowSearch] = useState(true);
  const [wizardShowFilters, setWizardShowFilters] = useState(true);
  const [wizardSortBy, setWizardSortBy] = useState('Default menu order');

  // Sidebar config state
  const [isActive, setIsActive] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState({ name: 'Default Table', style: 'MINIMAL' });
  const [activeTab, setActiveTab] = useState('tables'); // 'tables' | 'design' | 'advanced'
  const [isLicenseModalOpen, setIsLicenseModalOpen] = useState(false);

  // --- Saved Table Active Selection (Connected to dynamic live filters!) ---
  const [selectedSavedTable, setSelectedSavedTable] = useState('Shop Pages');

  // --- Active Table Metadata Object (Ensures live preview syncs with all wizard steps!) ---
  const activeTableData = useMemo(() => {
    return savedTablesList.find(t => t.name === selectedSavedTable) || savedTablesList[0] || SAVED_TABLES[0];
  }, [savedTablesList, selectedSavedTable]);

  // --- Design State (Tab 2) ---
  const [designState, setDesignState] = useState({ ...DESIGN_DEFAULTS });

  // --- ADVANCED STATE OPTIONS (Tab 3 - OVERHAULED WITH CSS) ---
  const [advAddToCartBtn, setAdvAddToCartBtn] = useState('Add to cart');
  const [advMultiAddToCartBtn, setAdvMultiAddToCartBtn] = useState('Add to cart');
  const [advSingularText, setAdvSingularText] = useState('Add 1 item for {total}');
  const [advPluralText, setAdvPluralText] = useState('Add {items} items for {total}');
  const [advMultiCartLocation, setAdvMultiCartLocation] = useState('Above table');
  const [advSelectAll, setAdvSelectAll] = useState(true);

  // Table Content
  const [advDescLength, setAdvDescLength] = useState(15);
  const [advShowHidden, setAdvShowHidden] = useState(false);
  const [advShowStickyHeader, setAdvShowStickyHeader] = useState(true);
  const [advHideTableHeader, setAdvHideTableHeader] = useState(false);
  const [advShowTableFooter, setAdvShowTableFooter] = useState(false);
  const [advScrollOffset, setAdvScrollOffset] = useState(15);

  // Product Search
  const [advSearchBox, setAdvSearchBox] = useState(true);
  const [advNumProductsFound, setAdvNumProductsFound] = useState('Below table');

  // Pagination
  const [advProductsPerPage, setAdvProductsPerPage] = useState(10);
  const [advPerPageControl, setAdvPerPageControl] = useState('Below table');
  const [advPaginationButtons, setAdvPaginationButtons] = useState('Below table');
  const [advPaginationType, setAdvPaginationType] = useState('Page numbers');

  // Responsive Options
  const [advResponsiveDisplay, setAdvResponsiveDisplay] = useState('plus-child'); // 'plus-child' | 'expand-all' | 'plus-modal'

  // Advanced Checkboxes & Inputs
  const [advUseAjax, setAdvUseAjax] = useState(false);
  const [advShortcodes, setAdvShortcodes] = useState(false);
  const [advCaching, setAdvCaching] = useState(false);
  const [advAccentSearch, setAdvAccentSearch] = useState(false);
  const [advDiacriticsSorting, setAdvDiacriticsSorting] = useState(false);
  const [advDateFormat, setAdvDateFormat] = useState('');
  const [advNoProductsMsg, setAdvNoProductsMsg] = useState('');
  const [advNoProductsFilteredMsg, setAdvNoProductsFilteredMsg] = useState('');

  // Uninstalling
  const [advDeleteDataOnUninstall, setAdvDeleteDataOnUninstall] = useState(false);

  // Custom CSS (Dynamic style injection!)
  const [advCustomCss, setAdvCustomCss] = useState(`/* Write your custom styling overrides here */
.wise-product-table-preview a {
  transition: color 0.2s ease-in-out;
}
.wise-product-table-preview button:hover {
  filter: brightness(1.1);
}`);

  // Active WooCommerce dynamic products state
  const [products, setProducts] = useState(() => {
    return (window.wiseTableProductData && window.wiseTableProductData.length > 0) 
      ? window.wiseTableProductData 
      : INITIAL_PRODUCTS;
  });

  // Preview state
  const [viewport, setViewport] = useState('desktop');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState('');
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' | 'desc'
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [variableOptions, setVariableOptions] = useState({});

  // Sync quantities and variations dynamically when products load or change
  React.useEffect(() => {
    setQuantities(prev => {
      const next = { ...prev };
      products.forEach(p => {
        if (next[p.id] === undefined) {
          next[p.id] = 1;
        }
      });
      return next;
    });

    setVariableOptions(prev => {
      const next = { ...prev };
      products.forEach(p => {
        if (p.isVariable && next[p.id] === undefined) {
          next[p.id] = { color: p.color !== 'N/A' ? p.color : 'Blue', size: p.size !== 'N/A' ? p.size : 'M' };
        }
      });
      return next;
    });
  }, [products]);

  // On Mount: Load settings from localized WooCommerce frontend data or fallback REST API
  React.useEffect(() => {
    // 1. Immediately apply localized data if available (prevent layout shift)
    const loadedData = window.wiseTableFrontendSettings;
    if (loadedData) {
      applyLoadedSettings(loadedData);
      if (window.wiseTableSelectedOverride) {
        setSelectedSavedTable(window.wiseTableSelectedOverride);
      }
    }

    // 2. In the frontend, always fetch the freshest data from the REST API 
    // to bypass any potential WordPress HTML page caching plugins!
    if (typeof wiseModuleData !== 'undefined' && wiseModuleData.apiUrl) {
      const cacheBustUrl = `${wiseModuleData.apiUrl}product-table/settings?_cb=${Date.now()}`;
      fetch(cacheBustUrl, {
        headers: { 'X-WP-Nonce': wiseModuleData.nonce }
      })
      .then(res => res.json())
      .then(data => {
        if (data && data.isActive !== undefined) {
          applyLoadedSettings(data);
        }
      })
      .catch(err => console.error('Error fetching fresh product table settings:', err));
    }
  }, []);

  const applyLoadedSettings = (data) => {
    if (data.isActive !== undefined) setIsActive(data.isActive);
    if (data.selectedSavedTable !== undefined) setSelectedSavedTable(data.selectedSavedTable);
    if (data.activeTemplate !== undefined) setActiveTemplate(data.activeTemplate);
    if (data.designState && !Array.isArray(data.designState)) {
      setDesignState(prev => ({ ...prev, ...data.designState }));
    }
    if (data.savedTablesList !== undefined && Array.isArray(data.savedTablesList)) {
      const mergedTables = data.savedTablesList.map((t, idx) => ({
        ...t,
        columns: t.columns || DEFAULT_COLUMNS,
        cartMethod: t.cartMethod || 'Cart buttons',
        showQty: t.showQty !== false,
        varMethod: t.varMethod || 'Show as dropdown lists',
        lazyLoad: t.lazyLoad || false,
        prodLimit: t.prodLimit || '500',
        showSearch: t.showSearch !== false,
        showFilters: t.showFilters !== false,
        sortBy: t.sortBy || 'Default menu order',
        filter: typeof t.filter === 'function' ? t.filter : (SAVED_TABLES[idx] ? SAVED_TABLES[idx].filter : (p) => true)
      }));
      setSavedTablesList(mergedTables);
    }
    
    if (data.advSettings) {
      const adv = data.advSettings;
      if (adv.advAddToCartBtn !== undefined) setAdvAddToCartBtn(adv.advAddToCartBtn);
      if (adv.advMultiAddToCartBtn !== undefined) setAdvMultiAddToCartBtn(adv.advMultiAddToCartBtn);
      if (adv.advSingularText !== undefined) setAdvSingularText(adv.advSingularText);
      if (adv.advPluralText !== undefined) setAdvPluralText(adv.advPluralText);
      if (adv.advMultiCartLocation !== undefined) setAdvMultiCartLocation(adv.advMultiCartLocation);
      if (adv.advSelectAll !== undefined) setAdvSelectAll(adv.advSelectAll);
      if (adv.advDescLength !== undefined) setAdvDescLength(adv.advDescLength);
      if (adv.advShowHidden !== undefined) setAdvShowHidden(adv.advShowHidden);
      if (adv.advShowStickyHeader !== undefined) setAdvShowStickyHeader(adv.advShowStickyHeader);
      if (adv.advHideTableHeader !== undefined) setAdvHideTableHeader(adv.advHideTableHeader);
      if (adv.advShowTableFooter !== undefined) setAdvShowTableFooter(adv.advShowTableFooter);
      if (adv.advScrollOffset !== undefined) setAdvScrollOffset(adv.advScrollOffset);
      if (adv.advSearchBox !== undefined) setAdvSearchBox(adv.advSearchBox);
      if (adv.advNumProductsFound !== undefined) setAdvNumProductsFound(adv.advNumProductsFound);
      if (adv.advProductsPerPage !== undefined) setAdvProductsPerPage(adv.advProductsPerPage);
      if (adv.advPerPageControl !== undefined) setAdvPerPageControl(adv.advPerPageControl);
      if (adv.advPaginationButtons !== undefined) setAdvPaginationButtons(adv.advPaginationButtons);
      if (adv.advPaginationType !== undefined) setAdvPaginationType(adv.advPaginationType);
      if (adv.advResponsiveDisplay !== undefined) setAdvResponsiveDisplay(adv.advResponsiveDisplay);
      if (adv.advUseAjax !== undefined) setAdvUseAjax(adv.advUseAjax);
      if (adv.advShortcodes !== undefined) setAdvShortcodes(adv.advShortcodes);
      if (adv.advCaching !== undefined) setAdvCaching(adv.advCaching);
      if (adv.advAccentSearch !== undefined) setAdvAccentSearch(adv.advAccentSearch);
      if (adv.advDiacriticsSorting !== undefined) setAdvDiacriticsSorting(adv.advDiacriticsSorting);
      if (adv.advDateFormat !== undefined) setAdvDateFormat(adv.advDateFormat);
      if (adv.advNoProductsMsg !== undefined) setAdvNoProductsMsg(adv.advNoProductsMsg);
      if (adv.advNoProductsFilteredMsg !== undefined) setAdvNoProductsFilteredMsg(adv.advNoProductsFilteredMsg);
      if (adv.advDeleteDataOnUninstall !== undefined) setAdvDeleteDataOnUninstall(adv.advDeleteDataOnUninstall);
      if (adv.advCustomCss !== undefined) setAdvCustomCss(adv.advCustomCss);
    }
  };

  // Fetch real WooCommerce products dynamically for the selected table in the backend editor!
  React.useEffect(() => {
    // Only fetch in backend admin if no pre-localized data exists
    if (!window.wiseTableProductData && typeof wiseModuleData !== 'undefined' && wiseModuleData.apiUrl) {
      fetch(`${wiseModuleData.apiUrl}product-table/products?table_name=${encodeURIComponent(selectedSavedTable)}`, {
        headers: {
          'X-WP-Nonce': wiseModuleData.nonce
        }
      })
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          setProducts(data);
        }
      })
      .catch(err => console.error('Error fetching WooCommerce products:', err));
    }
  }, [selectedSavedTable]);

  // Fetch complete real WooCommerce store metadata from the backend!
  React.useEffect(() => {
    if (typeof wiseModuleData !== 'undefined' && wiseModuleData.apiUrl) {
      fetch(`${wiseModuleData.apiUrl}product-table/store-metadata`, {
        headers: { 'X-WP-Nonce': wiseModuleData.nonce }
      })
      .then(res => res.json())
      .then(data => {
        if (data) {
          if (data.categories) { setStoreCategories(data.categories); setWizardCategories(data.categories.map(c => c.name)); }
          if (data.tags) { setStoreTags(data.tags); setWizardTags(data.tags.map(t => t.name)); }
          if (data.products) { setStoreProducts(data.products); setWizardProds(data.products.map(p => p.name)); }
          if (data.colors) { setStoreColors(data.colors); setWizardColors(data.colors); }
          if (data.sizes) { setStoreSizes(data.sizes); setWizardSizes(data.sizes); }
          if (data.custom_fields) { setStoreFields(data.custom_fields); setWizardFields(data.custom_fields.slice(0, 3)); }
          if (data.types) { setStoreTypes(data.types); setWizardTypes(data.types); }
          if (data.statuses) { setStoreStatuses(data.statuses); setWizardStatuses(data.statuses); }
          if (data.stocks) { setStoreStocks(data.stocks); setWizardStocks(data.stocks); }
        }
      })
      .catch(err => console.error('Error fetching WooCommerce store metadata:', err));
    }
  }, []);

  // Extract unique product taxonomies/attributes dynamically for filters!
  const uniqueCategories = useMemo(() => {
    const cats = new Set(products.map(p => p.category).filter(Boolean));
    return Array.from(cats);
  }, [products]);

  const uniqueColors = useMemo(() => {
    const colors = new Set(products.map(p => p.color).filter(c => c && c !== 'N/A'));
    return Array.from(colors);
  }, [products]);

  const uniqueSizes = useMemo(() => {
    const sizes = new Set(products.map(p => p.size).filter(s => s && s !== 'N/A'));
    return Array.from(sizes);
  }, [products]);

  const uniqueTags = useMemo(() => {
    const tags = new Set(products.map(p => p.tag).filter(Boolean));
    return Array.from(tags);
  }, [products]);

  // User notifications & visual cues
  const [toast, setToast] = useState(null);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);

  const triggerToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = () => {
    if (typeof wiseModuleData !== 'undefined' && wiseModuleData.apiUrl) {
      const payload = {
        isActive,
        selectedSavedTable,
        activeTemplate,
        designState,
        savedTablesList,
        advSettings: {
          advAddToCartBtn,
          advMultiAddToCartBtn,
          advSingularText,
          advPluralText,
          advMultiCartLocation,
          advSelectAll,
          advDescLength,
          advShowHidden,
          advShowStickyHeader,
          advHideTableHeader,
          advShowTableFooter,
          advScrollOffset,
          advSearchBox,
          advNumProductsFound,
          advProductsPerPage,
          advPerPageControl,
          advPaginationButtons,
          advPaginationType,
          advResponsiveDisplay,
          advUseAjax,
          advShortcodes,
          advCaching,
          advAccentSearch,
          advDiacriticsSorting,
          advDateFormat,
          advNoProductsMsg,
          advNoProductsFilteredMsg,
          advDeleteDataOnUninstall,
          advCustomCss
        }
      };

      fetch(`${wiseModuleData.apiUrl}product-table/settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': wiseModuleData.nonce
        },
        body: JSON.stringify(payload)
      })
      .then(res => res.json())
      .then(data => {
        triggerToast('All changes saved successfully! 🚀');
      })
      .catch(err => {
        console.error('Error saving settings:', err);
        triggerToast('Failed to save settings ⚠️', 'warning');
      });
    } else {
      triggerToast('All changes saved successfully (Preview mode)! 🚀');
    }
  };

  const applyTemplatePreset = (presetKey) => {
    let newDesign = { ...DESIGN_DEFAULTS };
    let newActiveTpl = { name: 'Default Table', style: 'MINIMAL' };

    if (presetKey === 'lilac-rose') {
      newDesign = {
        ...DESIGN_DEFAULTS,
        headerBgColor: '#f3f0ff',
        fontHeaderColor: '#312e81',
        fontHeaderSize: '12',
        borderExternalColor: '#f3f0ff',
        borderHeaderColor: '#eae6f5',
        borderHorizontalColor: '#f3f4f6',
        borderVerticalColor: 'transparent',
        borderVerticalSize: '0',
        fontCellColor: '#4b5563',
        fontHyperlinkColor: '#312e81',
        btnMainBgColor: '#ffe4e6',
        btnMainHoverBgColor: '#fecdd3',
        fontMainBtnColor: '#991b1b',
        fontMainBtnSize: '11',
        btnDisableBgColor: '#f3f4f6',
        fontDisableBtnColor: '#9ca3af',
        dropdownBorderColor: '#eae6f5',
        dropdownFontColor: '#312e81',
        searchBorderColor: '#eae6f5',
        searchFontColor: '#312e81',
        checkboxColor: '#4f46e5',
        cellBgStyle: 'no-alternate',
        cornerStyle: 'rounded'
      };
      newActiveTpl = { name: 'Lilac & Soft Rose', style: 'PREMIUM' };
    } else if (presetKey === 'royal-blue') {
      newDesign = {
        ...DESIGN_DEFAULTS,
        headerBgColor: '#2563eb',
        fontHeaderColor: '#ffffff',
        fontHeaderSize: '12',
        borderExternalColor: '#cbd5e1',
        borderHeaderColor: '#2563eb',
        borderHorizontalColor: '#cbd5e1',
        borderVerticalColor: 'transparent',
        borderVerticalSize: '0',
        fontCellColor: '#334155',
        fontHyperlinkColor: '#1d4ed8',
        btnMainBgColor: '#2563eb',
        btnMainHoverBgColor: '#1e40af',
        fontMainBtnColor: '#ffffff',
        fontMainBtnSize: '11',
        btnDisableBgColor: '#bfdbfe',
        fontDisableBtnColor: '#1e40af',
        dropdownBorderColor: '#2563eb',
        dropdownFontColor: '#1d4ed8',
        searchBorderColor: '#2563eb',
        searchFontColor: '#1d4ed8',
        checkboxColor: '#1d4ed8',
        cellBgStyle: 'alternate-rows',
        cornerStyle: 'fully-rounded' // fully-rounded pills for dropdowns/inputs as per design!
      };
      newActiveTpl = { name: 'Royal Blue Classic', style: 'PREMIUM' };
    } else {
      // Default Slate Table
      newDesign = { ...DESIGN_DEFAULTS };
      newActiveTpl = { name: 'Default Table', style: 'MINIMAL' };
    }

    setDesignState(newDesign);
    setActiveTemplate(newActiveTpl);
    setIsTemplateModalOpen(false);
    triggerToast(`Applied preset layout: ${newActiveTpl.name}! ✨`);
  };

  const handleResetDesign = () => {
    setDesignState({ ...DESIGN_DEFAULTS });
    triggerToast('Design reset to default! 🔄');
  };

  // Copy code utility
  const copyShortcodeToClipboard = (shortcode, tableName) => {
    if (!shortcode) return;
    
    const fallbackCopy = () => {
      const textArea = document.createElement("textarea");
      textArea.value = shortcode;
      textArea.style.position = "fixed"; 
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        triggerToast(`Copied [${tableName}] shortcode to clipboard! 📋`);
      } catch (err) {
        console.error('Fallback copy failed', err);
        triggerToast('Failed to copy shortcode ⚠️', 'warning');
      }
      document.body.removeChild(textArea);
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(shortcode)
        .then(() => {
          triggerToast(`Copied [${tableName}] shortcode to clipboard! 📋`);
        })
        .catch(() => {
          fallbackCopy();
        });
    } else {
      fallbackCopy();
    }
  };

  // Preview filtering, sorting & pagination logic
  const filteredProducts = useMemo(() => {
    const tableFilterFunc = activeTableData && typeof activeTableData.filter === 'function' ? activeTableData.filter : (p) => true;
    const limit = activeTableData && activeTableData.prodLimit ? parseInt(activeTableData.prodLimit || 500) : 500;

    let result = products.filter(product => {
      // Apply primary saved table category filters first
      if (!tableFilterFunc(product)) return false;

      // 1. Search Query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = product.name.toLowerCase().includes(query);
        const matchesDesc = product.summary.toLowerCase().includes(query);
        if (!matchesName && !matchesDesc) return false;
      }
      // 2. Category Dropdown
      if (selectedCategory && product.category !== selectedCategory) return false;
      // 3. Color Dropdown
      if (selectedColor && product.color !== selectedColor) return false;
      // 4. Size Dropdown
      if (selectedSize && product.size !== selectedSize) return false;
      
      // 5. Hidden products filter (Dynamic binding to Advanced settings!)
      const hideOutOfStock = !advShowHidden;
      if (hideOutOfStock && !product.inStock) return false;

      return true;
    });

    // If wizard filters resulted in 0 products (because mock preview products don't match live store categories/tags),
    // fallback to ignoring tableFilterFunc so the dashboard preview ALWAYS shows the product design!
    if (result.length === 0) {
      result = products.filter(product => {
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          const matchesName = product.name.toLowerCase().includes(query);
          const matchesDesc = product.summary.toLowerCase().includes(query);
          if (!matchesName && !matchesDesc) return false;
        }
        if (selectedCategory && product.category !== selectedCategory) return false;
        if (selectedColor && product.color !== selectedColor) return false;
        if (selectedSize && product.size !== selectedSize) return false;
        const hideOutOfStock = !advShowHidden;
        if (hideOutOfStock && !product.inStock) return false;
        return true;
      });
    }

    return result.slice(0, limit);
  }, [products, activeTableData, searchQuery, selectedCategory, selectedColor, selectedSize, advShowHidden]);

  const sortedProducts = useMemo(() => {
    let currentSortField = sortField;
    let currentSortOrder = sortOrder;

    if (!currentSortField && activeTableData && activeTableData.sortBy) {
      if (activeTableData.sortBy === 'Price: low to high') { currentSortField = 'price'; currentSortOrder = 'asc'; }
      else if (activeTableData.sortBy === 'Price: high to low') { currentSortField = 'price'; currentSortOrder = 'desc'; }
      else if (activeTableData.sortBy === 'Popularity (sales)') { currentSortField = 'sales'; currentSortOrder = 'desc'; }
      else if (activeTableData.sortBy === 'Average rating') { currentSortField = 'rating'; currentSortOrder = 'desc'; }
      else if (activeTableData.sortBy === 'Latest products') { currentSortField = 'id'; currentSortOrder = 'desc'; }
    }

    if (!currentSortField) return filteredProducts;
    
    return [...filteredProducts].sort((a, b) => {
      let valA = a[currentSortField];
      let valB = b[currentSortField];

      // Handle variable pricing sort
      if (typeof valA === 'string' && valA.includes('-')) valA = parseFloat(valA.split('-')[0]);
      if (typeof valB === 'string' && valB.includes('-')) valB = parseFloat(valB.split('-')[0]);

      if (valA < valB) return currentSortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return currentSortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredProducts, sortField, sortOrder, activeTableData]);

  // Pagination (Dynamic binding to Advanced settings value!)
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * advProductsPerPage;
    return sortedProducts.slice(startIndex, startIndex + advProductsPerPage);
  }, [sortedProducts, currentPage, advProductsPerPage]);

  const totalPages = useMemo(() => {
    return Math.ceil(sortedProducts.length / advProductsPerPage);
  }, [sortedProducts, advProductsPerPage]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleQtyChange = (id, val) => {
    const parsed = parseInt(val, 10);
    if (!isNaN(parsed) && parsed > 0) {
      setQuantities(prev => ({ ...prev, [id]: parsed }));
    }
  };

  const handleVariableChange = (id, key, val) => {
    setVariableOptions(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [key]: val
      }
    }));
  };

  // Select all products on current page
  const handleSelectAll = (checked) => {
    if (checked) {
      const allIds = paginatedProducts.map(p => p.id);
      setSelectedProducts(prev => {
        const union = new Set([...prev, ...allIds]);
        return Array.from(union);
      });
    } else {
      const pageIds = paginatedProducts.map(p => p.id);
      setSelectedProducts(prev => prev.filter(id => !pageIds.includes(id)));
    }
  };

  const isAllPageProductsSelected = useMemo(() => {
    if (paginatedProducts.length === 0) return false;
    return paginatedProducts.every(p => selectedProducts.includes(p.id));
  }, [paginatedProducts, selectedProducts]);

  const toggleProductSelect = (id) => {
    setSelectedProducts(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSingleAddToCart = (product) => {
    const qty = quantities[product.id] || 1;
    const hasVars = product.isVariable && variableOptions[product.id];
    const varsText = hasVars ? ` (${variableOptions[product.id].color}, ${variableOptions[product.id].size})` : '';

    // If we have localized WooCommerce products (Frontend mode)
    if (window.wiseTableProductData) {
      triggerToast('Adding to cart... ⏳');
      const formData = new FormData();
      formData.append('product_id', product.id);
      formData.append('quantity', qty);

      if (hasVars) {
        // Pass standard WooCommerce variation options if selected
        formData.append('variation_id', product.id);
        formData.append('attribute_pa_color', variableOptions[product.id].color.toLowerCase());
        formData.append('attribute_pa_size', variableOptions[product.id].size.toLowerCase());
      }

      fetch(window.location.origin + '/?wc-ajax=add_to_cart', {
        method: 'POST',
        body: formData
      })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          // Fallback to URL redirection
          window.location.href = `?add-to-cart=${product.id}&quantity=${qty}`;
        } else {
          triggerToast(`Added ${qty} × ${product.name}${varsText} to cart! 🛒`);
          // Trigger header mini-cart refresh
          if (window.jQuery) {
            window.jQuery(document.body).trigger('added_to_cart', [data.fragments, data.cart_hash]);
          }
        }
      })
      .catch(err => {
        window.location.href = `?add-to-cart=${product.id}&quantity=${qty}`;
      });
    } else {
      triggerToast(`Added ${qty} × ${product.name}${varsText} to cart! 🛒`);
    }
  };

  // Multi add selected
  const handleMultiAddToCart = async () => {
    if (selectedProducts.length === 0) {
      triggerToast('Please select at least one product! ⚠️', 'warning');
      return;
    }
    
    // Calculate total price dynamically for selected items
    const selectedItems = products.filter(p => selectedProducts.includes(p.id));
    const totalCost = selectedItems.reduce((sum, item) => sum + (item.price * (quantities[item.id] || 1)), 0);
    const count = selectedProducts.length;

    // Apply the user's custom plurals string settings
    let msgTemplate = count === 1 ? advSingularText : advPluralText;
    let text = msgTemplate
      .replace('{items}', count.toString())
      .replace('{total}', `$${totalCost.toFixed(2)}`)
      .replace('{total_rounded}', `$${Math.round(totalCost)}`);

    if (window.wiseTableProductData) {
      triggerToast('Adding selected products to cart... ⏳');
      
      try {
        for (const productId of selectedProducts) {
          const qty = quantities[productId] || 1;
          const formData = new FormData();
          formData.append('product_id', productId);
          formData.append('quantity', qty);

          await fetch(window.location.origin + '/?wc-ajax=add_to_cart', {
            method: 'POST',
            body: formData
          });
        }

        triggerToast(`Bulk added: "${text}" to cart! 🛒 ✨`);
        setSelectedProducts([]);
        
        // Refresh fragments
        if (window.jQuery) {
          window.jQuery(document.body).trigger('wc_fragment_refresh');
        }
      } catch (err) {
        console.error('Error in bulk add to cart:', err);
        triggerToast('Some selected products could not be added ⚠️', 'warning');
      }
    } else {
      triggerToast(`Bulk added: "${text}" to cart! 🛒 ✨`);
      setSelectedProducts([]);
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedColor('');
    setSelectedSize('');
    setCurrentPage(1);
    triggerToast('Filters reset successfully!');
  };

  // Limit summary length in words dynamically (using Advanced Tab state!)
  const getTruncatedSummary = (text) => {
    const count = parseInt(advDescLength, 10) || 15;
    const words = text.split(' ');
    if (words.length <= count) return text;
    return words.slice(0, count).join(' ') + '...';
  };

  // Update Design State Values
  const updateDesignValue = (key, val) => {
    setDesignState(prev => ({ ...prev, [key]: val }));
  };

  // Custom Color Picker component
  const ColorPickerField = ({ stateKey, label }) => {
    const colorInputRef = useRef(null);
    return (
      <div className="flex items-center justify-between gap-2 py-1.5 border-b border-slate-50">
        {/* Label */}
        {label && <span className="text-[11px] font-bold text-slate-600 truncate max-w-[130px]">{label}</span>}
        
        {/* Color picker custom box */}
        <div 
          onClick={() => colorInputRef.current?.click()}
          className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5 pr-2.5 cursor-pointer hover:border-slate-355 transition-all select-none gap-2 w-[110px] shrink-0 relative overflow-hidden"
        >
          <div 
            className="w-6 h-5 rounded-md border border-slate-100 shadow-sm shrink-0"
            style={{ backgroundColor: designState[stateKey] }}
          />
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-tight truncate">
            {designState[stateKey]}
          </span>
          <input 
            ref={colorInputRef}
            type="color" 
            value={designState[stateKey]} 
            onChange={(e) => updateDesignValue(stateKey, e.target.value)} 
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>
      </div>
    );
  };

  // Border row generator helper
  const BorderSettingsRow = ({ colorKey, sizeKey, label, iconSvg }) => {
    const colorInputRef = useRef(null);
    return (
      <div className="flex items-center justify-between gap-2 py-1.5 border-b border-slate-50">
        
        {/* Left Side Custom Color button */}
        <div 
          onClick={() => colorInputRef.current?.click()}
          className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5 pr-2 cursor-pointer hover:border-slate-350 transition-all gap-1.5 w-[90px] shrink-0 relative overflow-hidden"
        >
          <div 
            className="w-5 h-4.5 rounded shadow-sm border border-slate-100 shrink-0"
            style={{ backgroundColor: designState[colorKey] }}
          />
          <span className="text-[9px] font-black text-slate-500 truncate uppercase">
            {designState[colorKey]}
          </span>
          <input 
            ref={colorInputRef}
            type="color" 
            value={designState[colorKey]} 
            onChange={(e) => updateDesignValue(colorKey, e.target.value)} 
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>

        {/* Size Input Box */}
        <input 
          type="text" 
          placeholder="Size"
          value={designState[sizeKey]}
          onChange={(e) => updateDesignValue(sizeKey, e.target.value)}
          className="w-12 bg-white border border-slate-200 rounded-lg py-1 px-1.5 text-center text-[10px] font-bold text-slate-700 outline-none focus:border-blue-500 shrink-0"
        />

        {/* Label & Border Icon */}
        <div className="flex items-center gap-1.5 justify-end flex-1 min-w-0">
          <span className="text-[10px] font-bold text-slate-500 truncate">{label}</span>
          <div className="w-5 h-5 flex items-center justify-center bg-slate-50 rounded border border-slate-100 text-slate-400 shrink-0">
            {iconSvg}
          </div>
        </div>

      </div>
    );
  };

  // Font row generator helper
  const FontSettingsRow = ({ colorKey, sizeKey, label }) => {
    const colorInputRef = useRef(null);
    return (
      <div className="flex items-center justify-between gap-2 py-1.5 border-b border-slate-50">
        
        {/* Left Color Swatch */}
        <div 
          onClick={() => colorInputRef.current?.click()}
          className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5 pr-2 cursor-pointer hover:border-slate-350 transition-all gap-1.5 w-[90px] shrink-0"
        >
          <div 
            className="w-5 h-4.5 rounded shadow-sm border border-slate-100 shrink-0"
            style={{ backgroundColor: designState[colorKey] }}
          />
          <span className="text-[9px] font-black text-slate-500 truncate uppercase">
            {designState[colorKey]}
          </span>
          <input 
            ref={colorInputRef}
            type="color" 
            value={designState[colorKey]} 
            onChange={(e) => updateDesignValue(colorKey, e.target.value)} 
            className="sr-only"
          />
        </div>

        {/* Size input box */}
        <input 
          type="text" 
          placeholder="Size"
          value={designState[sizeKey]}
          onChange={(e) => updateDesignValue(sizeKey, e.target.value)}
          className="w-12 bg-white border border-slate-200 rounded-lg py-1 px-1.5 text-center text-[10px] font-bold text-slate-700 outline-none focus:border-blue-500 shrink-0"
        />

        {/* Font label */}
        <span className="text-[10px] font-bold text-slate-500 flex-1 text-right truncate">
          {label}
        </span>

      </div>
    );
  };

  // Simulated Table dynamic Border-Radius style generator
  const getTableBorderRadius = () => {
    if (designState.cornerStyle === 'square') return '0px';
    if (designState.cornerStyle === 'rounded') return '12px';
    if (designState.cornerStyle === 'fully-rounded') return '24px';
    return '8px'; // default
  };

  const getElementBorderRadius = () => {
    if (designState.cornerStyle === 'square') return '0px';
    if (designState.cornerStyle === 'rounded') return '8px';
    if (designState.cornerStyle === 'fully-rounded') return '20px';
    return '6px'; // default
  };

  const isFrontend = window.wiseTableProductData !== undefined;

  const renderTableContent = () => {
    return (
      <>
        {!isActive ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
              <EyeOff className="w-8 h-8" />
            </div>
            <h3 className="text-sm font-extrabold text-slate-800 mb-1">Product Table Disabled</h3>
            <p className="text-xs text-slate-400 max-w-xs font-semibold">
              Turn on "Module Status" in the sidebar to enable live rendering and design customized layout tables.
            </p>
          </div>
        ) : (
          <div className="space-y-6 flex-1 flex flex-col">
            
            {/* Row: Search & Filters (Controlled dynamically by Advanced Tab 'advSearchBox' state & activeTableData!) */}
            {advSearchBox && (
              <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between shrink-0">
                {activeTableData?.showFilters !== false ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <select 
                      value={selectedCategory} 
                      onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
                      style={{
                        backgroundColor: designState.dropdownBgColor,
                        color: designState.dropdownFontColor,
                        border: `${designState.dropdownBorderSize}px solid ${designState.dropdownBorderColor}`,
                        borderRadius: getElementBorderRadius()
                      }}
                      className="px-3 py-1.5 text-xs font-bold outline-none focus:border-blue-500 shrink-0"
                    >
                      <option value="">Category</option>
                      {uniqueCategories.length > 0 ? (
                        uniqueCategories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))
                      ) : (
                        <>
                          <option value="Apparel">Apparel</option>
                          <option value="Music">Music</option>
                          <option value="Accessories">Accessories</option>
                        </>
                      )}
                    </select>

                    <select 
                      value={selectedColor} 
                      onChange={(e) => { setSelectedColor(e.target.value); setCurrentPage(1); }}
                      style={{
                        backgroundColor: designState.dropdownBgColor,
                        color: designState.dropdownFontColor,
                        border: `${designState.dropdownBorderSize}px solid ${designState.dropdownBorderColor}`,
                        borderRadius: getElementBorderRadius()
                      }}
                      className="px-3 py-1.5 text-xs font-bold outline-none focus:border-blue-500 shrink-0"
                    >
                      <option value="">Color</option>
                      {uniqueColors.length > 0 ? (
                        uniqueColors.map(color => (
                          <option key={color} value={color}>{color}</option>
                        ))
                      ) : (
                        <>
                          <option value="Blue">Blue</option>
                          <option value="Grey">Grey</option>
                          <option value="Red">Red</option>
                          <option value="White">White</option>
                          <option value="Black">Black</option>
                          <option value="Brown">Brown</option>
                        </>
                      )}
                    </select>

                    <select 
                      value={selectedSize} 
                      onChange={(e) => { setSelectedSize(e.target.value); setCurrentPage(1); }}
                      style={{
                        backgroundColor: designState.dropdownBgColor,
                        color: designState.dropdownFontColor,
                        border: `${designState.dropdownBorderSize}px solid ${designState.dropdownBorderColor}`,
                        borderRadius: getElementBorderRadius()
                      }}
                      className="px-3 py-1.5 text-xs font-bold outline-none focus:border-blue-500 shrink-0"
                    >
                      <option value="">Size</option>
                      {uniqueSizes.length > 0 ? (
                        uniqueSizes.map(size => (
                          <option key={size} value={size}>{size}</option>
                        ))
                      ) : (
                        <>
                          <option value="S">Size S</option>
                          <option value="M">Size M</option>
                          <option value="L">Size L</option>
                          <option value="XL">Size XL</option>
                          <option value="One Size">One Size</option>
                        </>
                      )}
                    </select>

                    <button 
                      onClick={handleResetFilters}
                      style={{ borderRadius: getElementBorderRadius() }}
                      className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-600 transition-all flex items-center gap-1.5 shrink-0"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Reset
                    </button>
                  </div>
                ) : <div />}

                {/* Search bar */}
                {activeTableData?.showSearch !== false ? (
                  <div className="relative max-w-xs w-full shrink-0">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Search className="h-3.5 w-3.5 text-slate-400" />
                    </span>
                    <input 
                      type="text" 
                      value={searchQuery}
                      onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                      style={{
                        backgroundColor: designState.searchBgColor,
                        color: designState.searchFontColor,
                        border: `${designState.searchBorderSize}px solid ${designState.searchBorderColor}`,
                        borderRadius: getElementBorderRadius()
                      }}
                      placeholder="Search products..."
                      className="w-full pl-9 pr-4 py-1.5 text-xs font-bold outline-none focus:border-blue-500"
                    />
                  </div>
                ) : <div />}
              </div>
            )}

            {/* Multi Add to Cart (Above Table) - Dynamically controlled by 'advMultiCartLocation' */}
            {(advMultiCartLocation === 'Above table' || advMultiCartLocation === 'Both') && (
              <div className="flex justify-end shrink-0">
                <button 
                  onClick={handleMultiAddToCart}
                  style={{ 
                    backgroundColor: designState.btnMainBgColor,
                    color: designState.fontMainBtnColor,
                    fontSize: `${designState.fontMainBtnSize}px`,
                    borderRadius: getElementBorderRadius()
                  }}
                  className="px-4 py-2 font-black hover:opacity-95 transition-all shadow-md flex items-center gap-2"
                >
                  <ShoppingCart className="w-3.5 h-3.5" /> {advMultiAddToCartBtn}
                </button>
              </div>
            )}

            {/* Real Interactive Data Grid */}
            <div 
              style={{ 
                border: `${designState.borderExternalSize}px solid ${designState.borderExternalColor}`,
                borderRadius: getElementBorderRadius()
              }}
              className="flex-1 overflow-hidden bg-white shadow-sm"
            >
              <div className="overflow-x-auto max-w-full">
                <table className="w-full border-collapse">
                  {/* Table Header Controls (Linked to 'advHideTableHeader'!) */}
                  {!advHideTableHeader && (
                    <thead 
                      style={{ 
                        backgroundColor: designState.headerBgColor,
                        borderBottom: `${designState.borderHeaderSize}px solid ${designState.borderHeaderColor}`
                      }}
                      className="text-left text-[11px] font-black uppercase tracking-wider"
                    >
                      <tr>
                        {(activeTableData?.columns || DEFAULT_COLUMNS).map(col => {
                          let respClass = '';
                          if (col.respVis === 'desktop only') respClass = 'hidden md:table-cell';
                          if (col.respVis === 'mobile only') respClass = 'table-cell md:hidden';

                          let widthStyle = {};
                          if (col.width) widthStyle.width = `${col.width}${col.widthUnit || '%'}`;

                          let headerLabel = col.showHeading !== false ? col.name : '';

                          let thStyle = { 
                            color: designState.fontHeaderColor, 
                            fontSize: `${designState.fontHeaderSize}px`, 
                            backgroundColor: designState.headerBgColor,
                            ...widthStyle 
                          };

                          if (col.id === 'name' || col.id === 'price') {
                            return (
                              <th key={col.id} style={thStyle} className={`py-3.5 px-4 ${respClass}`}>
                                {col.showHeading !== false ? (
                                  <button onClick={() => handleSort(col.id)} className="flex items-center gap-1 hover:opacity-85 font-black uppercase flex">
                                    {col.name} <ArrowUpDown className="w-3 h-3 ml-1" />
                                  </button>
                                ) : null}
                              </th>
                            );
                          }

                          if (col.id === 'buy') {
                            return (
                              <th key={col.id} style={thStyle} className={`py-3.5 px-4 w-44 shrink-0 ${respClass}`}>
                                {headerLabel}
                              </th>
                            );
                          }

                          if (col.id === 'select' || col.id === 'checkbox') {
                            return (
                              <th key={col.id} style={thStyle} className={`py-3.5 px-4 text-center w-16 shrink-0 ${respClass}`}>
                                {advSelectAll && (
                                  <input 
                                    type="checkbox" 
                                    checked={isAllPageProductsSelected}
                                    onChange={(e) => handleSelectAll(e.target.checked)}
                                    style={{ accentColor: designState.checkboxColor, color: designState.checkboxColor }}
                                    className="w-4 h-4 rounded border-slate-350 cursor-pointer"
                                  />
                                )}
                              </th>
                            );
                          }

                          return (
                            <th key={col.id} style={thStyle} className={`py-3.5 px-4 ${col.id === 'image' ? 'text-center w-20 shrink-0' : ''} ${respClass}`}>
                              {headerLabel}
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                  )}

                  {/* Table Body */}
                  <tbody className="text-xs font-semibold">
                    {paginatedProducts.length === 0 ? (
                      <tr>
                        <td colSpan={(activeTableData?.columns || DEFAULT_COLUMNS).length} className="py-12 text-center text-slate-400 font-semibold italic">
                          {advNoProductsMsg || advNoProductsFilteredMsg || 'No products found matching your search selection.'}
                        </td>
                      </tr>
                    ) : (
                      paginatedProducts.map((product, pIndex) => {
                        let rowBgColor = designState.cellBgColor;
                        if (designState.cellBgStyle === 'alternate-rows' && pIndex % 2 !== 0) {
                          rowBgColor = designState.headerBgColor === '#2563eb' ? '#f0f7ff' : '#f8fafc';
                        }

                        return (
                          <tr 
                            key={product.id} 
                            style={{ 
                              backgroundColor: selectedProducts.includes(product.id) ? 'rgba(37, 99, 235, 0.05)' : rowBgColor,
                              borderBottom: `${designState.borderHorizontalSize}px solid ${designState.borderHorizontalColor}`
                            }}
                            className="hover:bg-slate-50/40 transition-colors"
                          >
                            {(activeTableData?.columns || DEFAULT_COLUMNS).map(col => {
                              let respClass = '';
                              if (col.respVis === 'desktop only') respClass = 'hidden md:table-cell';
                              if (col.respVis === 'mobile only') respClass = 'table-cell md:hidden';

                              let cellStyle = { 
                                borderRight: `${designState.borderVerticalSize}px solid ${designState.borderVerticalColor}`,
                                backgroundColor: selectedProducts.includes(product.id) ? 'rgba(37, 99, 235, 0.05)' : rowBgColor
                              };

                              // Image Column
                              if (col.id === 'image') {
                                const imgContent = (
                                  <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-100/60 shadow-sm mx-auto bg-slate-100">
                                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                  </div>
                                );
                                return (
                                  <td key={col.id} style={cellStyle} className={`py-3 px-4 text-center shrink-0 ${respClass}`}>
                                    {col.addLink !== false ? (
                                      <a href="#" onClick={(e) => { e.preventDefault(); if (col.linkType === 'lightbox') triggerToast('Opened product image in lightbox! 🔍'); }} className="block hover:opacity-90 transition-opacity">
                                        {imgContent}
                                      </a>
                                    ) : imgContent}
                                  </td>
                                );
                              }

                              // Name Column
                              if (col.id === 'name') {
                                return (
                                  <td key={col.id} style={cellStyle} className={`py-3 px-4 ${respClass}`}>
                                    {col.addLink !== false ? (
                                      <a href="#" style={{ color: designState.fontHyperlinkColor, fontSize: `${designState.fontHyperlinkSize}px` }} className="font-extrabold hover:underline leading-snug block">
                                        {product.name}
                                      </a>
                                    ) : (
                                      <span style={{ color: designState.fontCellColor, fontSize: `${designState.fontCellSize}px` }} className="font-extrabold leading-snug block">
                                        {product.name}
                                      </span>
                                    )}
                                    {product.onSale && (
                                      <span className="inline-block bg-rose-50 text-rose-600 text-[9px] font-black tracking-widest px-1.5 py-0.5 rounded-md mt-1 uppercase">
                                        Sale
                                      </span>
                                    )}
                                  </td>
                                );
                              }

                              // Summary Column
                              if (col.id === 'summary') {
                                return (
                                  <td key={col.id} style={cellStyle} className={`py-3 px-4 max-w-[280px] ${respClass}`}>
                                    <p className="text-slate-400 font-medium leading-normal text-[11px]">
                                      {getTruncatedSummary(product.summary)}
                                    </p>
                                  </td>
                                );
                              }

                              // Price Column
                              if (col.id === 'price') {
                                return (
                                  <td key={col.id} style={cellStyle} className={`py-3 px-4 font-bold text-slate-800 text-[11px] ${respClass}`}>
                                    {product.onSale ? (
                                      <div className="flex flex-col gap-0.5">
                                        <span className="line-through text-slate-400 font-medium">${product.regularPrice.toFixed(2)}</span>
                                        <span className="text-rose-500 font-extrabold">${product.price.toFixed(2)}</span>
                                      </div>
                                    ) : (
                                      <span>${product.price.toFixed(2)}</span>
                                    )}
                                  </td>
                                );
                              }

                              // Buy Column
                              if (col.id === 'buy') {
                                const cartMethod = activeTableData?.cartMethod || 'Cart buttons';
                                const showQty = activeTableData?.showQty !== false;
                                const varMethod = activeTableData?.varMethod || 'Show as dropdown lists';

                                return (
                                  <td key={col.id} style={cellStyle} className={`py-3 px-4 w-44 shrink-0 ${respClass}`}>
                                    <div className="flex flex-col gap-2">
                                      {/* Variations display */}
                                      {product.isVariable && variableOptions[product.id] && (
                                        varMethod === 'Show as dropdown lists' ? (
                                          <div className="flex gap-1.5">
                                            <select 
                                              value={variableOptions[product.id].color}
                                              onChange={(e) => handleVariableChange(product.id, 'color', e.target.value)}
                                              style={{ borderRadius: getElementBorderRadius() }}
                                              className="flex-1 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 py-1 px-1.5 text-[9px] font-bold text-slate-600 outline-none transition-all"
                                            >
                                              <option value="Blue">Blue</option>
                                              <option value="Grey">Grey</option>
                                              <option value="Red">Red</option>
                                            </select>
                                            <select 
                                              value={variableOptions[product.id].size}
                                              onChange={(e) => handleVariableChange(product.id, 'size', e.target.value)}
                                              style={{ borderRadius: getElementBorderRadius() }}
                                              className="flex-1 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 py-1 px-1.5 text-[9px] font-bold text-slate-650 outline-none transition-all"
                                            >
                                              <option value="S">S</option>
                                              <option value="M">M</option>
                                              <option value="L">L</option>
                                            </select>
                                          </div>
                                        ) : (
                                          <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 inline-block text-center">
                                            Variations: {varMethod}
                                          </span>
                                        )
                                      )}

                                      {/* Qty input & Add to cart button */}
                                      <div className="flex gap-2 items-center">
                                        {cartMethod !== 'Cart buttons' && (
                                          <input 
                                            type="checkbox" 
                                            checked={selectedProducts.includes(product.id)}
                                            onChange={() => toggleProductSelect(product.id)}
                                            style={{ accentColor: designState.checkboxColor }}
                                            className="w-4 h-4 rounded border-slate-350 cursor-pointer shrink-0"
                                          />
                                        )}

                                        {!product.isExternal && product.inStock && showQty && cartMethod !== 'Checkbox only' && (
                                          <input 
                                            type="number" 
                                            value={quantities[product.id] || 1}
                                            onChange={(e) => handleQtyChange(product.id, e.target.value)}
                                            min="1"
                                            style={{ 
                                              borderRadius: getElementBorderRadius(),
                                              backgroundColor: designState.quantityBgColor || '#f8fafc',
                                              color: designState.quantityFontColor || '#1e293b',
                                              fontSize: `${designState.quantityFontSize || 12}px`
                                            }}
                                            className="w-11 px-1.5 py-1 text-center font-bold border border-slate-200 outline-none focus:border-blue-500"
                                          />
                                        )}

                                        {cartMethod !== 'Checkbox only' && (
                                          <button 
                                            onClick={() => handleSingleAddToCart(product)}
                                            style={{ 
                                              backgroundColor: !product.inStock ? designState.btnDisableBgColor : designState.btnMainBgColor,
                                              color: !product.inStock ? designState.fontDisableBtnColor : designState.fontMainBtnColor,
                                              fontSize: !product.inStock ? `${designState.fontDisableBtnSize}px` : `${designState.fontMainBtnSize}px`,
                                              borderRadius: getElementBorderRadius()
                                            }}
                                            className="wise-main-btn px-3 py-1.5 font-black tracking-wider uppercase transition-all duration-200 flex-1 whitespace-nowrap shadow-sm hover:scale-[1.02]"
                                          >
                                            {product.isExternal ? 'Buy Product' : advAddToCartBtn}
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  </td>
                                );
                              }

                              // Checkbox Select Column
                              if (col.id === 'select' || col.id === 'checkbox') {
                                return (
                                  <td key={col.id} style={cellStyle} className={`py-3 px-4 text-center ${respClass}`}>
                                    <input 
                                      type="checkbox" 
                                      checked={selectedProducts.includes(product.id)}
                                      onChange={() => toggleProductSelect(product.id)}
                                      style={{ accentColor: designState.checkboxColor, color: designState.checkboxColor }}
                                      className="w-4 h-4 rounded border-slate-350 cursor-pointer"
                                    />
                                  </td>
                                );
                              }

                              // Stock Column
                              if (col.id === 'stock') {
                                return (
                                  <td key={col.id} style={cellStyle} className={`py-3 px-4 text-center ${respClass}`}>
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${product.inStock ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                                      {product.inStock ? 'In Stock' : 'Out of Stock'}
                                    </span>
                                  </td>
                                );
                              }

                              // Rating Column
                              if (col.id === 'rating') {
                                return (
                                  <td key={col.id} style={cellStyle} className={`py-3 px-4 text-center ${respClass}`}>
                                    <span className="text-amber-500 font-bold text-xs tracking-widest">⭐⭐⭐⭐⭐</span>
                                    <span className="text-[10px] text-slate-400 ml-1 font-semibold">({product.id % 2 === 0 ? '5.0' : '4.8'})</span>
                                  </td>
                                );
                              }

                              // SKU Column
                              if (col.id === 'sku') {
                                return (
                                  <td key={col.id} style={cellStyle} className={`py-3 px-4 font-mono text-xs font-bold text-slate-500 ${respClass}`}>
                                    SKU-{product.id + 1000}
                                  </td>
                                );
                              }

                              // Categories Column
                              if (col.id === 'categories') {
                                return (
                                  <td key={col.id} style={cellStyle} className={`py-3 px-4 text-xs font-bold text-blue-600 ${respClass}`}>
                                    {product.category}
                                  </td>
                                );
                              }

                              // Tags Column
                              if (col.id === 'tags') {
                                return (
                                  <td key={col.id} style={cellStyle} className={`py-3 px-4 text-xs font-bold text-slate-600 ${respClass}`}>
                                    <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200/80 inline-block">
                                      {product.tag || 'Standard'}
                                    </span>
                                  </td>
                                );
                              }

                              return <td key={col.id} style={cellStyle} className={`py-3 px-4 ${respClass}`} />;
                            })}
                          </tr>
                        );
                      })
                    )}
                  </tbody>

                  {/* Optional Duplicate Footer Header (Linked to 'advShowTableFooter'!) */}
                  {advShowTableFooter && !advHideTableHeader && (
                    <tfoot 
                      style={{ 
                        backgroundColor: designState.headerBgColor,
                        borderTop: `${designState.borderHeaderSize}px solid ${designState.borderHeaderColor}`
                      }}
                      className="text-left text-[11px] font-black uppercase tracking-wider"
                    >
                      <tr>
                        {(activeTableData?.columns || DEFAULT_COLUMNS).map(col => {
                          let respClass = '';
                          if (col.respVis === 'desktop only') respClass = 'hidden md:table-cell';
                          if (col.respVis === 'mobile only') respClass = 'table-cell md:hidden';

                          let widthStyle = {};
                          if (col.width) widthStyle.width = `${col.width}${col.widthUnit || '%'}`;

                          let headerLabel = col.showHeading !== false ? col.name : '';

                          if (col.id === 'name' || col.id === 'price') {
                            return (
                              <th key={col.id} style={{ color: designState.fontHeaderColor, fontSize: `${designState.fontHeaderSize}px`, ...widthStyle }} className={`py-3 px-4 ${respClass}`}>
                                {col.showHeading !== false ? col.name : ''}
                              </th>
                            );
                          }

                          if (col.id === 'buy') {
                            return (
                              <th key={col.id} style={{ color: designState.fontHeaderColor, fontSize: `${designState.fontHeaderSize}px`, ...widthStyle }} className={`py-3 px-4 w-44 shrink-0 ${respClass}`}>
                                {headerLabel}
                              </th>
                            );
                          }

                          if (col.id === 'select' || col.id === 'checkbox') {
                            return (
                              <th key={col.id} style={{ color: designState.fontHeaderColor, fontSize: `${designState.fontHeaderSize}px`, ...widthStyle }} className={`py-3 px-4 text-center w-16 shrink-0 ${respClass}`}>
                                {headerLabel}
                              </th>
                            );
                          }

                          return (
                            <th key={col.id} style={{ color: designState.fontHeaderColor, fontSize: `${designState.fontHeaderSize}px`, ...widthStyle }} className={`py-3 px-4 ${col.id === 'image' ? 'text-center w-20 shrink-0' : ''} ${respClass}`}>
                              {headerLabel}
                            </th>
                          );
                        })}
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </div>

            {/* Live Table Footer */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mt-auto pt-4 border-t border-slate-100 shrink-0">
              
              {/* Products Found Counter - Linked to 'advNumProductsFound' */}
              {advNumProductsFound !== 'Hidden' ? (
                <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                  Showing {paginatedProducts.length} of {filteredProducts.length} products
                </div>
              ) : (
                <div />
              )}

              {/* Pagination Controls - Linked to 'advPaginationButtons' */}
              {advPaginationButtons !== 'Hidden' && totalPages > 1 && (
                <div className="flex gap-1.5">
                  <button 
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    style={{ borderRadius: getElementBorderRadius() }}
                    className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-slate-50 border border-slate-250 text-[10px] font-black uppercase tracking-wider transition-colors"
                  >
                    Previous
                  </button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button 
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      style={{ borderRadius: getElementBorderRadius() }}
                      className={`w-8 h-8 text-xs font-black transition-all ${currentPage === i + 1 ? 'bg-slate-950 text-white shadow-sm' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button 
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    style={{ borderRadius: getElementBorderRadius() }}
                    className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-slate-50 border border-slate-250 text-[10px] font-black uppercase tracking-wider transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}

              {/* Multi Add to Cart (Below Table) - Dynamically controlled by 'advMultiCartLocation' */}
              {(advMultiCartLocation === 'Below table' || advMultiCartLocation === 'Both') && (
                <button 
                  onClick={handleMultiAddToCart}
                  style={{ 
                    backgroundColor: designState.btnMainBgColor,
                    color: designState.fontMainBtnColor,
                    fontSize: `${designState.fontMainBtnSize}px`,
                    borderRadius: getElementBorderRadius()
                  }}
                  className="px-4 py-2 font-black hover:opacity-95 transition-all shadow-md flex items-center gap-2"
                >
                  <ShoppingCart className="w-3.5 h-3.5" /> {advMultiAddToCartBtn}
                </button>
              )}
            </div>
          </div>
        )}
      </>
    );
  };

  if (isFrontend) {
    return (
      <div className="bg-white flex flex-col font-sans select-none antialiased wise-product-table-preview">
        {/* Real-time Dynamic Custom CSS Injected instantly into the Preview frame! */}
        <style>{`
          ${advCustomCss}
          .wise-product-table-preview button.wise-main-btn:hover {
            background-color: ${designState.btnMainHoverBgColor || '#1e293b'} !important;
          }
        `}</style>
        
        {renderTableContent()}

        {/* Active Toast Notification */}
        {toast && (
          <div 
            style={{ borderRadius: getElementBorderRadius() }}
            className={`fixed bottom-8 right-8 px-5 py-3 shadow-xl flex items-center gap-2.5 text-xs font-bold text-white transition-all duration-300 transform translate-y-0 scale-100 z-[9999] animate-bounce ${toast.type === 'warning' ? 'bg-amber-500' : 'bg-slate-900 border border-slate-800'}`}
          >
            {toast.type !== 'warning' && <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />}
            <span>{toast.msg}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-32px)] bg-slate-50 flex flex-col font-sans select-none antialiased overflow-hidden">
      
      {/* License Activation Modal */}
      {isLicenseModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div 
            className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-500"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-blue-50 text-blue-650 rounded-full flex items-center justify-center mx-auto mb-6 shadow-md shadow-blue-100/50">
                <TableProperties size={30} />
              </div>
              
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Pro License Required</h2>
              
              <p className="text-sm text-slate-500 mt-3 leading-relaxed font-semibold">
                Wise Product Table is a premium feature. You must have the <strong>wiseCampaign Pro</strong> plugin installed and an active license key to enable this widget.
              </p>
              
              <div className="mt-8 flex flex-col gap-3">
                <a 
                  href={window.wiseModuleData?.pro?.licensePageUrl || 'admin.php?page=wisecampaign_plugin_license'}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-sm text-center shadow-lg shadow-blue-100 hover:shadow-xl transition-all"
                >
                  Activate License Key
                </a>
                <button 
                  onClick={() => setIsLicenseModalOpen(false)}
                  className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-black text-sm transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Real-time Dynamic Custom CSS Injected instantly into the Preview frame! */}
      <style>{`
        ${advCustomCss}
        .wise-product-table-preview button.wise-main-btn:hover {
          background-color: ${designState.btnMainHoverBgColor || '#1e293b'} !important;
        }
      `}</style>

      {/* Top Header Bar */}
      <header className="h-16 px-6 bg-white border-b border-slate-100 flex items-center justify-between shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white font-extrabold text-lg shadow-md shadow-emerald-100">
            W
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-slate-800 tracking-tight text-sm md:text-base">wiseCampaign</span>
              <span className="h-4 w-px bg-slate-200"></span>
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Wise Product Table Editor</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-4">
          {/* Active Toast Notification */}
          {toast && (
            <div 
              style={{ borderRadius: getElementBorderRadius() }}
              className={`px-4 py-2 shadow-md flex items-center gap-2 text-xs font-bold text-white transition-all duration-300 animate-bounce ${toast.type === 'warning' ? 'bg-amber-500' : 'bg-slate-900 border border-slate-800'}`}
            >
              {toast.type !== 'warning' && <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />}
              <span>{toast.msg}</span>
            </div>
          )}

          <div className="bg-slate-100 p-0.5 rounded-xl flex items-center gap-1">
            <button 
              onClick={() => setViewport('desktop')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${viewport === 'desktop' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              <Laptop className="w-3.5 h-3.5" /> Desktop
            </button>
            <button 
              onClick={() => setViewport('mobile')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${viewport === 'mobile' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
          </div>

          <button 
            onClick={handleSave}
            className="h-10 px-5 bg-slate-900 text-white rounded-xl text-xs font-black tracking-wider uppercase hover:bg-slate-800 transition-all flex items-center gap-2 shadow-lg shadow-slate-100 hover:scale-[1.02]"
          >
            <Save className="w-3.5 h-3.5" /> Save Changes
          </button>
        </div>
      </header>

      {/* Main Workspace split */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side Sidebar Panel */}
        <aside className="w-[300px] border-r border-slate-100 bg-white flex flex-col shrink-0 overflow-hidden">
          
          {/* Module Active Toggler Card */}
          <div className="p-4 border-b border-slate-100 shrink-0">
            <div className="bg-slate-50/50 border border-slate-100 p-4 rounded-2xl flex items-center justify-between hover:shadow-sm transition-all duration-200">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                  <TableProperties className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-black text-slate-800 tracking-wide block font-sans">Module Status</span>
                  <span className="text-[9px] font-bold text-slate-400 block mt-0.5">{isActive ? 'ENABLED' : 'DISABLED'}</span>
                </div>
              </div>

              {/* Animated Switch */}
              <button
                type="button"
                onClick={() => {
                  const newVal = !isActive;
                  const isLicenseActive = window.wiseModuleData?.pro?.isLicenseActive;
                  if (newVal && !isLicenseActive) {
                    setIsLicenseModalOpen(true);
                    return;
                  }
                  setIsActive(newVal);
                }}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus:outline-none shadow-inner ${isActive ? 'bg-emerald-500' : 'bg-slate-200'}`}
              >
                <span className="sr-only">Toggle Module Status</span>
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-300 ease-in-out ${isActive ? 'translate-x-5' : 'translate-x-0'}`}
                />
              </button>
            </div>
          </div>

          {/* Configuration Tabs Header */}
          <div className="flex border-b border-slate-100 shrink-0">
            {[
              { key: 'tables', label: 'Product Tables', icon: <Grid className="w-3.5 h-3.5" /> },
              { key: 'design', label: 'Design', icon: <Sparkles className="w-3.5 h-3.5" /> },
              { key: 'advance', label: 'Advance', icon: <Layers className="w-3.5 h-3.5" /> }
            ].map(tab => (
              <button
                key={tab.key}
                disabled={!isActive}
                onClick={() => isActive && setActiveTab(tab.key)}
                className={`flex-1 py-3 text-[10px] font-extrabold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all border-b-2 ${
                  isActive
                    ? (activeTab === tab.key ? 'border-slate-900 text-slate-900 bg-slate-50/50' : 'border-transparent text-slate-400 hover:text-slate-700')
                    : 'border-transparent text-slate-300 cursor-not-allowed'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {/* Left panel Tab content */}
          <div className="flex-1 overflow-y-auto px-4 py-5 scrollbar-thin">
            {!isActive ? (
              <div className="py-20 flex flex-col items-center justify-center text-center px-4 space-y-4 animate-in fade-in duration-300">
                <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-350 shadow-inner">
                  <TableProperties size={32} />
                </div>
                <div>
                  <h4 className="text-sm font-black text-[#0F172A] uppercase tracking-wider">Module Hidden</h4>
                  <p className="text-xs text-slate-450 font-bold max-w-[200px] mx-auto mt-2 leading-relaxed">
                    The configuration panel is hidden because the module is deactivated.
                  </p>
                </div>
                <button 
                  onClick={() => {
                    const isLicenseActive = window.wiseModuleData?.pro?.isLicenseActive;
                    if (!isLicenseActive) {
                      setIsLicenseModalOpen(true);
                      return;
                    }
                    setIsActive(true);
                  }}
                  className="px-6 py-2 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-100 transition-all active:scale-95"
                >
                  Activate Now
                </button>
              </div>
            ) : (
              <>
                {/* 1. PRODUCT TABLES TAB */}
                {activeTab === 'tables' && (
              <div className="space-y-4">
                
                {/* Info Note banner */}
                <div className="p-3.5 bg-blue-50/40 border border-blue-100 rounded-2xl">
                  <span className="text-[10px] font-black text-blue-650 uppercase tracking-widest block mb-1 font-sans">Tables dashboard</span>
                  <p className="text-[10px] font-semibold text-blue-800 leading-normal">
                    Create multiple product tables to filter shop accessories, clothing or main checkout. Add them to pages using standard shortcodes.
                  </p>
                </div>

                {/* Add New Table Button */}
                <button
                  onClick={() => {
                    setWizardStep(1);
                    setWizardTableName('');
                    setIsAddTableWizardOpen(true);
                  }}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs font-black tracking-wider uppercase shadow-md flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                >
                  <Plus className="w-4 h-4 stroke-[3]" /> Add New Table
                </button>

                <div className="space-y-2.5">
                  {savedTablesList.map(table => (
                    <div 
                      key={table.name}
                      onClick={() => {
                        setSelectedSavedTable(table.name);
                        triggerToast(`Switched active table query to: ${table.name}! 🔄`);
                      }}
                      className={`p-3.5 border rounded-2xl text-left cursor-pointer transition-all duration-200 hover:scale-[1.01] hover:shadow-sm ${selectedSavedTable === table.name ? 'border-slate-900 bg-slate-950 text-white' : 'border-slate-100 bg-white hover:border-slate-300'}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-[11px] font-black tracking-wide ${selectedSavedTable === table.name ? 'text-white' : 'text-slate-800'}`}>
                          {table.name}
                        </span>
                        {selectedSavedTable === table.name && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                        )}
                      </div>
                      
                      <p className={`text-[9px] mt-1 leading-normal font-semibold ${selectedSavedTable === table.name ? 'text-slate-300' : 'text-slate-450'}`}>
                        {table.display}
                      </p>

                      <div className="mt-3 flex items-center justify-between border-t border-slate-100/10 pt-2.5 gap-2">
                        {/* Copy Code badge */}
                        <div 
                          title="Click to copy shortcode"
                          onClick={(e) => {
                            e.stopPropagation();
                            const sc = table.shortcode || '[product_table id="1"]';
                            copyShortcodeToClipboard(sc, table.name);
                          }}
                          className={`cursor-pointer px-2.5 py-1.5 rounded-lg text-[9px] font-bold font-mono transition-all flex items-center gap-1.5 hover:scale-[1.03] active:scale-95 border ${selectedSavedTable === table.name ? 'bg-white/10 text-white border-white/20 hover:bg-white/15' : 'bg-slate-50 text-slate-650 border-slate-100 hover:bg-slate-100'}`}
                        >
                          <Copy className="w-3 h-3" /> {table.shortcode || '[product_table id="1"]'}
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-1.5">
                          {/* Template change button */}
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsTemplateModalOpen(true);
                            }}
                            className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-wider rounded-lg transition-colors flex items-center gap-1 ${selectedSavedTable === table.name ? 'bg-blue-600 text-white hover:bg-blue-500' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                          >
                            <Sparkles className="w-2.5 h-2.5" /> Change Template
                          </button>

                          {/* Delete Table Button (only for custom tables) */}
                          {table.name !== 'Shop Pages' && (
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm(`Are you sure you want to delete "${table.name}"?`)) {
                                  setSavedTablesList(prev => prev.filter(t => t.name !== table.name));
                                  if (selectedSavedTable === table.name) {
                                    setSelectedSavedTable('Shop Pages');
                                  }
                                  triggerToast(`Deleted "${table.name}" 🗑️`);
                                }
                              }}
                              className={`p-1 rounded-lg transition-colors ${selectedSavedTable === table.name ? 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30' : 'bg-rose-50 text-rose-600 hover:bg-rose-100'}`}
                              title="Delete Table"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 2. DESIGN TAB */}
            {activeTab === 'design' && (
              <div className="space-y-5">
                
                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                  <div>
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider font-sans">Design Customize</h3>
                    <p className="text-[9px] text-slate-400 font-semibold leading-none mt-0.5">Customize elements to match shop aesthetic.</p>
                  </div>
                  
                  {/* Reset button */}
                  <button 
                    onClick={handleResetDesign}
                    className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 transition-colors"
                    title="Reset to default design"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Section A: Borders */}
                <div className="space-y-3">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block font-sans">Borders customization</span>
                  <div className="bg-slate-50/40 border border-slate-100 rounded-2xl p-3.5 space-y-3.5">
                    
                    {/* External border */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-black text-slate-550 uppercase tracking-wider block font-sans">External border</span>
                      <div className="flex items-center gap-2">
                        <ColorPickerField stateKey="borderExternalColor" />
                        <select 
                          value={designState.borderExternalSize}
                          onChange={(e) => updateDesignValue('borderExternalSize', e.target.value)}
                          className="bg-white border border-slate-200 rounded-lg py-1 px-1.5 text-[10px] font-bold text-slate-700 outline-none w-16"
                        >
                          {[0,1,2,3,4,5].map(x => <option key={x} value={x}>{x}px</option>)}
                        </select>
                      </div>
                    </div>

                    {/* Header border */}
                    <div className="space-y-1.5 border-t border-slate-100 pt-3">
                      <span className="text-[10px] font-black text-slate-550 uppercase tracking-wider block font-sans">Header border</span>
                      <div className="flex items-center gap-2">
                        <ColorPickerField stateKey="borderHeaderColor" />
                        <select 
                          value={designState.borderHeaderSize}
                          onChange={(e) => updateDesignValue('borderHeaderSize', e.target.value)}
                          className="bg-white border border-slate-200 rounded-lg py-1 px-1.5 text-[10px] font-bold text-slate-700 outline-none w-16"
                        >
                          {[0,1,2,3,4,5].map(x => <option key={x} value={x}>{x}px</option>)}
                        </select>
                      </div>
                    </div>

                    {/* Horizontal Cell border */}
                    <div className="space-y-1.5 border-t border-slate-100 pt-3">
                      <span className="text-[10px] font-black text-slate-550 uppercase tracking-wider block font-sans">Horizontal cell border</span>
                      <div className="flex items-center gap-2">
                        <ColorPickerField stateKey="borderHorizontalColor" />
                        <select 
                          value={designState.borderHorizontalSize}
                          onChange={(e) => updateDesignValue('borderHorizontalSize', e.target.value)}
                          className="bg-white border border-slate-200 rounded-lg py-1 px-1.5 text-[10px] font-bold text-slate-700 outline-none w-16"
                        >
                          {[0,1,2,3,4,5].map(x => <option key={x} value={x}>{x}px</option>)}
                        </select>
                      </div>
                    </div>

                    {/* Vertical Cell border */}
                    <div className="space-y-1.5 border-t border-slate-100 pt-3">
                      <span className="text-[10px] font-black text-slate-550 uppercase tracking-wider block font-sans">Vertical cell border</span>
                      <div className="flex items-center gap-2">
                        <ColorPickerField stateKey="borderVerticalColor" />
                        <select 
                          value={designState.borderVerticalSize}
                          onChange={(e) => updateDesignValue('borderVerticalSize', e.target.value)}
                          className="bg-white border border-slate-200 rounded-lg py-1 px-1.5 text-[10px] font-bold text-slate-700 outline-none w-16"
                        >
                          {[0,1,2,3,4,5].map(x => <option key={x} value={x}>{x}px</option>)}
                        </select>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Section B: Fonts */}
                <div className="space-y-3">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block font-sans">Fonts & Typography</span>
                  <div className="bg-slate-50/40 border border-slate-100 rounded-2xl p-3.5 space-y-3.5">
                    
                    {/* Header Font */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block font-sans">Header Typography</span>
                      <div className="flex items-center gap-2">
                        <ColorPickerField stateKey="fontHeaderColor" />
                        <select 
                          value={designState.fontHeaderSize}
                          onChange={(e) => updateDesignValue('fontHeaderSize', e.target.value)}
                          className="bg-white border border-slate-200 rounded-lg py-1 px-1.5 text-[10px] font-bold text-slate-700 outline-none w-16"
                        >
                          {[10,11,12,13,14,15].map(x => <option key={x} value={x}>{x}px</option>)}
                        </select>
                      </div>
                    </div>

                    {/* Cell Font */}
                    <div className="space-y-1.5 border-t border-slate-100 pt-3">
                      <span className="text-[10px] font-black text-slate-550 uppercase tracking-wider block font-sans">Cell Typography</span>
                      <div className="flex items-center gap-2">
                        <ColorPickerField stateKey="fontCellColor" />
                        <select 
                          value={designState.fontCellSize}
                          onChange={(e) => updateDesignValue('fontCellSize', e.target.value)}
                          className="bg-white border border-slate-200 rounded-lg py-1 px-1.5 text-[10px] font-bold text-slate-700 outline-none w-16"
                        >
                          {[10,11,12,13,14,15].map(x => <option key={x} value={x}>{x}px</option>)}
                        </select>
                      </div>
                    </div>

                    {/* Hyperlink Font */}
                    <div className="space-y-1.5 border-t border-slate-100 pt-3">
                      <span className="text-[10px] font-black text-slate-550 uppercase tracking-wider block font-sans">Hyperlinks</span>
                      <div className="flex items-center gap-2">
                        <ColorPickerField stateKey="fontHyperlinkColor" />
                        <select 
                          value={designState.fontHyperlinkSize}
                          onChange={(e) => updateDesignValue('fontHyperlinkSize', e.target.value)}
                          className="bg-white border border-slate-200 rounded-lg py-1 px-1.5 text-[10px] font-bold text-slate-700 outline-none w-16"
                        >
                          {[10,11,12,13,14,15].map(x => <option key={x} value={x}>{x}px</option>)}
                        </select>
                      </div>
                    </div>

                    {/* Main Button Font */}
                    <div className="space-y-1.5 border-t border-slate-100 pt-3">
                      <span className="text-[10px] font-black text-slate-550 uppercase tracking-wider block font-sans">Main Button Font</span>
                      <div className="flex items-center gap-2">
                        <ColorPickerField stateKey="fontMainBtnColor" />
                        <select 
                          value={designState.fontMainBtnSize}
                          onChange={(e) => updateDesignValue('fontMainBtnSize', e.target.value)}
                          className="bg-white border border-slate-200 rounded-lg py-1 px-1.5 text-[10px] font-bold text-slate-700 outline-none w-16"
                        >
                          {[10,11,12,13,14,15].map(x => <option key={x} value={x}>{x}px</option>)}
                        </select>
                      </div>
                    </div>

                    {/* Disable Button Font */}
                    <div className="space-y-1.5 border-t border-slate-100 pt-3">
                      <span className="text-[10px] font-black text-slate-555 uppercase tracking-wider block font-sans">Disable Button Font</span>
                      <div className="flex items-center gap-2">
                        <ColorPickerField stateKey="fontDisableBtnColor" />
                        <select 
                          value={designState.fontDisableBtnSize}
                          onChange={(e) => updateDesignValue('fontDisableBtnSize', e.target.value)}
                          className="bg-white border border-slate-200 rounded-lg py-1 px-1.5 text-[10px] font-bold text-slate-700 outline-none w-16"
                        >
                          {[10,11,12,13,14,15].map(x => <option key={x} value={x}>{x}px</option>)}
                        </select>
                      </div>
                    </div>

                    {/* Quantity Font */}
                    <div className="space-y-1.5 border-t border-slate-100 pt-3">
                      <span className="text-[10px] font-black text-slate-555 uppercase tracking-wider block font-sans">Quantity input font</span>
                      <div className="flex items-center gap-2">
                        <ColorPickerField stateKey="quantityFontColor" />
                        <select 
                          value={designState.quantityFontSize || '11'}
                          onChange={(e) => updateDesignValue('quantityFontSize', e.target.value)}
                          className="bg-white border border-slate-200 rounded-lg py-1 px-1.5 text-[10px] font-bold text-slate-700 outline-none w-16"
                        >
                          {[10,11,12,13,14,15].map(x => <option key={x} value={x}>{x}px</option>)}
                        </select>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Section C: Button Backgrounds */}
                <div className="space-y-3">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block font-sans">Button Backgrounds</span>
                  <div className="bg-slate-50/40 border border-slate-100 rounded-2xl p-3.5 space-y-3">
                    <ColorPickerField stateKey="btnMainBgColor" label="Main Button" />
                    <ColorPickerField stateKey="btnMainHoverBgColor" label="Main Button Hover" />
                    <ColorPickerField stateKey="btnDisableBgColor" label="Disabled Button" />
                    <ColorPickerField stateKey="quantityBgColor" label="Quantity Background" />
                  </div>
                </div>

                {/* Section D: Search Settings */}
                <div className="space-y-3">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block font-sans">Search customization</span>
                  <div className="bg-slate-50/40 border border-slate-100 rounded-2xl p-3.5 space-y-3">
                    <ColorPickerField stateKey="searchBgColor" label="Background color" />
                    <ColorPickerField stateKey="searchFontColor" label="Font color" />
                    <div className="flex items-center justify-between border-b border-slate-50 py-1.5">
                      <span className="text-[11px] font-bold text-slate-655 border-slate-355 border-slate-350">Border size & color</span>
                      <div className="flex items-center gap-2">
                        <ColorPickerField stateKey="searchBorderColor" />
                        <select 
                          value={designState.searchBorderSize}
                          onChange={(e) => updateDesignValue('searchBorderSize', e.target.value)}
                          className="bg-white border border-slate-200 rounded-lg py-1 px-1.5 text-[10px] font-bold text-slate-700 outline-none w-16"
                        >
                          {[0,1,2,3,4,5].map(x => <option key={x} value={x}>{x}px</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section E: Dropdowns Settings */}
                <div className="space-y-3">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block font-sans">Dropdowns customization</span>
                  <div className="bg-slate-50/40 border border-slate-100 rounded-2xl p-3.5 space-y-3">
                    <ColorPickerField stateKey="dropdownBgColor" label="Background color" />
                    <ColorPickerField stateKey="dropdownFontColor" label="Font color" />
                    <div className="flex items-center justify-between border-b border-slate-50 py-1.5">
                      <span className="text-[11px] font-bold text-slate-655 border-slate-355 border-slate-350">Border size & color</span>
                      <div className="flex items-center gap-2">
                        <ColorPickerField stateKey="dropdownBorderColor" />
                        <select 
                          value={designState.dropdownBorderSize}
                          onChange={(e) => updateDesignValue('dropdownBorderSize', e.target.value)}
                          className="bg-white border border-slate-200 rounded-lg py-1 px-1.5 text-[10px] font-bold text-slate-700 outline-none w-16"
                        >
                          {[0,1,2,3,4,5].map(x => <option key={x} value={x}>{x}px</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section F: Checkboxes & Badges */}
                <div className="space-y-3">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block font-sans">Checkboxes color</span>
                  <div className="bg-slate-50/40 border border-slate-100 rounded-2xl p-3.5 space-y-3">
                    <ColorPickerField stateKey="checkboxColor" label="Checkbox Accent" />
                  </div>
                </div>

                {/* Section G: Cell Backgrounds */}
                <div className="space-y-3">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block font-sans">Cell Backgrounds</span>
                  <div className="bg-slate-50/40 border border-slate-100 rounded-2xl p-4 space-y-3.5 text-xs font-bold text-slate-655">
                    
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-black text-slate-550 uppercase tracking-wider block font-sans">Standard Cell Color</span>
                      <ColorPickerField stateKey="cellBgColor" />
                    </div>

                    <div className="border-t border-slate-100 pt-3">
                      <label className="text-[10px] font-black text-slate-455 uppercase tracking-widest block mb-2 font-sans">Row Shading Type</label>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2.5 cursor-pointer select-none">
                          <input 
                            type="radio" 
                            name="cellBgStyle"
                            checked={designState.cellBgStyle === 'no-alternate'}
                            onChange={() => updateDesignValue('cellBgStyle', 'no-alternate')}
                            className="w-4 h-4 text-blue-600 border-slate-300"
                          />
                          <span className="text-[11px] font-bold text-slate-600">No alternate rows shading</span>
                        </label>
                        <label className="flex items-center gap-2.5 cursor-pointer select-none">
                          <input 
                            type="radio" 
                            name="cellBgStyle"
                            checked={designState.cellBgStyle === 'alternate-rows'}
                            onChange={() => updateDesignValue('cellBgStyle', 'alternate-rows')}
                            className="w-4 h-4 text-blue-600 border-slate-300"
                          />
                          <span className="text-[11px] font-bold text-slate-600">Alternate rows shaded color</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section H: Table Headers Color */}
                <div className="space-y-3">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block font-sans">Header backgrounds</span>
                  <div className="bg-slate-50/40 border border-slate-100 rounded-2xl p-3.5 space-y-3">
                    <ColorPickerField stateKey="headerBgColor" label="Header Background" />
                  </div>
                </div>

                {/* Section I: Corner style */}
                <div className="space-y-3">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block font-sans">Corner Rounded Style</span>
                  <div className="bg-slate-50/40 border border-slate-100 rounded-2xl p-4 text-xs font-bold text-slate-655 space-y-2.5">
                    {[
                      { key: 'square', label: 'Square corner design' },
                      { key: 'rounded', label: 'Standard rounded border' },
                      { key: 'fully-rounded', label: 'Fully rounded pill filters' }
                    ].map(styleOpt => (
                      <label key={styleOpt.key} className="flex items-center gap-2.5 cursor-pointer select-none">
                        <input 
                          type="radio" 
                          name="cornerStyle"
                          checked={designState.cornerStyle === styleOpt.key}
                          onChange={() => updateDesignValue('cornerStyle', styleOpt.key)}
                          className="w-4 h-4 text-blue-600 border-slate-300"
                        />
                        <span className="text-[11px] font-bold text-slate-600">{styleOpt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* 3. ADVANCE TAB */}
            {activeTab === 'advance' && (
              <div className="space-y-6">
                
                {/* A. BUTTON TEXT LABELS */}
                <div className="space-y-3">
                  <span className="text-[11px] font-black text-slate-800 uppercase tracking-wider block font-sans">Buttons Text Labels</span>
                  <div className="bg-slate-50/40 border border-slate-100 rounded-2xl p-4 space-y-3">
                    
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block font-sans">Single Add to Cart</label>
                      <input 
                        type="text" 
                        value={advAddToCartBtn}
                        onChange={(e) => setAdvAddToCartBtn(e.target.value)}
                        placeholder="Add to cart"
                        className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-[11px] font-semibold text-slate-700 outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="space-y-1 border-t border-slate-100/55 pt-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block font-sans">Multi Add to Cart</label>
                      <input 
                        type="text" 
                        value={advMultiAddToCartBtn}
                        onChange={(e) => setAdvMultiAddToCartBtn(e.target.value)}
                        placeholder="Add selected to cart"
                        className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-[11px] font-semibold text-slate-700 outline-none focus:border-blue-500"
                      />
                    </div>

                  </div>
                </div>

                {/* B. MULTI ADD TO CART MESSAGES (PLURALIZATION) */}
                <div className="space-y-3">
                  <span className="text-[11px] font-black text-slate-800 uppercase tracking-wider block font-sans">Bulk Cart Pluralization</span>
                  <div className="bg-slate-50/40 border border-slate-100 rounded-2xl p-4 space-y-3">
                    
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block font-sans">Singular Item added</label>
                        <span className="text-[8px] font-bold text-slate-400">{`{items}, {total}`}</span>
                      </div>
                      <input 
                        type="text" 
                        value={advSingularText}
                        onChange={(e) => setAdvSingularText(e.target.value)}
                        placeholder="{items} item ({total}) added"
                        className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-[11px] font-semibold text-slate-700 outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="space-y-1 border-t border-slate-100/55 pt-3">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block font-sans">Plural Items added</label>
                        <span className="text-[8px] font-bold text-slate-400">{`{items}, {total_rounded}`}</span>
                      </div>
                      <input 
                        type="text" 
                        value={advPluralText}
                        onChange={(e) => setAdvPluralText(e.target.value)}
                        placeholder="{items} items ({total}) added"
                        className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-[11px] font-semibold text-slate-700 outline-none focus:border-blue-500"
                      />
                    </div>

                  </div>
                </div>

                {/* C. MULTI CART BUTTON PLACEMENT */}
                <div className="space-y-3">
                  <span className="text-[11px] font-black text-slate-800 uppercase tracking-wider block font-sans">Bulk Cart Button Location</span>
                  <div className="bg-slate-50/40 border border-slate-100 rounded-2xl p-4 text-xs font-bold text-slate-655 space-y-2.5">
                    {[
                      { key: 'Above table', label: 'Above the table grid' },
                      { key: 'Below table', label: 'Below the table grid' },
                      { key: 'Both', label: 'Display in both positions' },
                      { key: 'Hidden', label: 'Hide bulk cart button completely' }
                    ].map(locOpt => (
                      <label key={locOpt.key} className="flex items-center gap-2.5 cursor-pointer select-none">
                        <input 
                          type="radio" 
                          name="advMultiCartLocation"
                          checked={advMultiCartLocation === locOpt.key}
                          onChange={() => setAdvMultiCartLocation(locOpt.key)}
                          className="w-4 h-4 text-blue-600 border-slate-350"
                        />
                        <span className="text-[11px] font-bold text-slate-650">{locOpt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* D. GENERAL CONTROLS AND TOGGLES */}
                <div className="space-y-3">
                  <span className="text-[11px] font-black text-slate-800 uppercase tracking-wider block font-sans">Grid Settings Toggles</span>
                  <div className="bg-slate-50/40 border border-slate-100 rounded-2xl p-4 space-y-4 text-xs font-bold text-slate-655">
                    
                    <label className="flex items-center gap-2.5 cursor-pointer py-0.5 select-none">
                      <input 
                        type="checkbox" 
                        checked={advSelectAll}
                        onChange={(e) => setAdvSelectAll(e.target.checked)}
                        className="w-4 h-4 rounded text-blue-600 border-slate-300"
                      />
                      <span className="text-[11px] font-bold text-slate-650">
                        Allow "Select All" column checkbox
                      </span>
                    </label>

                    <label className="flex items-center gap-2.5 cursor-pointer py-0.5 select-none border-t border-slate-100/55 pt-3">
                      <input 
                        type="checkbox" 
                        checked={advShowHidden}
                        onChange={(e) => setAdvShowHidden(e.target.checked)}
                        className="w-4 h-4 rounded text-blue-600 border-slate-300"
                      />
                      <span className="text-[11px] font-bold text-slate-650">
                        Display out-of-stock items in table
                      </span>
                    </label>

                    <label className="flex items-center gap-2.5 cursor-pointer py-0.5 select-none border-t border-slate-100/55 pt-3">
                      <input 
                        type="checkbox" 
                        checked={advShowStickyHeader}
                        onChange={(e) => setAdvShowStickyHeader(e.target.checked)}
                        className="w-4 h-4 rounded text-blue-600 border-slate-300"
                      />
                      <span className="text-[11px] font-bold text-slate-650">
                        Enable sticky table header scrolling
                      </span>
                    </label>

                    <label className="flex items-center gap-2.5 cursor-pointer py-0.5 select-none border-t border-slate-100/55 pt-3">
                      <input 
                        type="checkbox" 
                        checked={advHideTableHeader}
                        onChange={(e) => setAdvHideTableHeader(e.target.checked)}
                        className="w-4 h-4 rounded text-blue-600 border-slate-300"
                      />
                      <span className="text-[11px] font-bold text-slate-650">
                        Hide table header row completely
                      </span>
                    </label>

                    <label className="flex items-center gap-2.5 cursor-pointer py-0.5 select-none border-t border-slate-100/55 pt-3">
                      <input 
                        type="checkbox" 
                        checked={advShowTableFooter}
                        onChange={(e) => setAdvShowTableFooter(e.target.checked)}
                        className="w-4 h-4 rounded text-blue-600 border-slate-300"
                      />
                      <span className="text-[11px] font-bold text-slate-655">
                        Display table footer duplicate header
                      </span>
                    </label>

                    <div className="space-y-1 border-t border-slate-100/55 pt-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block font-sans">Product short description length</label>
                      <div className="flex items-center gap-2">
                        <input 
                          type="number" 
                          value={advDescLength}
                          onChange={(e) => setAdvDescLength(e.target.value)}
                          min="1"
                          max="100"
                          className="bg-white border border-slate-200 rounded-lg py-1 px-1.5 text-[10px] font-bold text-slate-700 outline-none w-16"
                        />
                        <span className="text-[10px] text-slate-400 font-bold">words max</span>
                      </div>
                    </div>

                    <div className="space-y-1 border-t border-slate-100/55 pt-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block font-sans">Scroll offset</label>
                      <div className="flex items-center gap-2">
                        <input 
                          type="number" 
                          value={advScrollOffset}
                          onChange={(e) => setAdvScrollOffset(e.target.value)}
                          min="0"
                          className="bg-white border border-slate-200 rounded-lg py-1 px-1.5 text-[10px] font-bold text-slate-700 outline-none w-16"
                        />
                        <span className="text-[10px] text-slate-400 font-bold">pixels</span>
                      </div>
                    </div>

                  </div>
                </div>

                {/* E. RESPONSIVE OPTIONS */}
                <div className="space-y-3">
                  <span className="text-[11px] font-black text-slate-800 uppercase tracking-wider block font-sans">Responsive options</span>
                  <div className="bg-slate-50/40 border border-slate-100 rounded-2xl p-4 space-y-3 text-xs font-bold text-slate-655">
                    
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1 font-sans">Responsive display</label>
                    
                    {[
                      { key: 'plus-child', label: 'Click a plus icon to display a child row' },
                      { key: 'expand-all', label: 'Expand all child rows automatically' },
                      { key: 'plus-modal', label: 'Click a plus icon to open a modal window' }
                    ].map(opt => (
                      <label key={opt.key} className="flex items-start gap-2.5 cursor-pointer select-none">
                        <input 
                          type="radio" 
                          name="advResponsiveDisplay"
                          checked={advResponsiveDisplay === opt.key}
                          onChange={() => setAdvResponsiveDisplay(opt.key)}
                          className="w-4 h-4 text-blue-600 border-slate-300 mt-0.5"
                        />
                        <span className="text-[11px] font-bold text-slate-600 leading-snug">
                          {opt.label}
                        </span>
                      </label>
                    ))}
                    
                    <p className="text-[9px] text-slate-400 font-medium leading-normal mt-1 pt-1.5 border-t border-slate-100/40">
                      How extra data is displayed when there are too many columns to fit in the table.
                    </p>

                  </div>
                </div>

                {/* F. ADVANCED SUB-OPTIONS */}
                <div className="space-y-3">
                  <span className="text-[11px] font-black text-slate-800 uppercase tracking-wider block font-sans">Advanced settings</span>
                  <div className="bg-slate-50/40 border border-slate-100 rounded-2xl p-4 space-y-4 text-xs font-bold text-slate-655">
                    
                    <label className="flex items-center gap-2.5 cursor-pointer py-0.5 select-none">
                      <input 
                        type="checkbox" 
                        checked={advUseAjax}
                        onChange={(e) => setAdvUseAjax(e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-slate-300"
                      />
                      <span className="text-[11px] font-bold text-slate-600">
                        Use AJAX when adding to the cart
                      </span>
                    </label>

                    <label className="flex items-center gap-2.5 cursor-pointer py-0.5 select-none border-t border-slate-100/55 pt-3">
                      <input 
                        type="checkbox" 
                        checked={advShortcodes}
                        onChange={(e) => setAdvShortcodes(e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-slate-300"
                      />
                      <span className="text-[11px] font-bold text-slate-600">
                        Show shortcodes, HTML and other formatting in the table
                      </span>
                    </label>

                    <label className="flex items-center gap-2.5 cursor-pointer py-0.5 select-none border-t border-slate-100/55 pt-3">
                      <input 
                        type="checkbox" 
                        checked={advCaching}
                        onChange={(e) => setAdvCaching(e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-slate-300"
                      />
                      <span className="text-[11px] font-bold text-slate-600">
                        Enable settings caching for speed
                      </span>
                    </label>

                    <label className="flex items-center gap-2.5 cursor-pointer py-0.5 select-none border-t border-slate-100/55 pt-3">
                      <input 
                        type="checkbox" 
                        checked={advAccentSearch}
                        onChange={(e) => setAdvAccentSearch(e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-slate-300"
                      />
                      <span className="text-[11px] font-bold text-slate-600">
                        Enable accent-insensitive search queries
                      </span>
                    </label>

                    <label className="flex items-center gap-2.5 cursor-pointer py-0.5 select-none border-t border-slate-100/55 pt-3">
                      <input 
                        type="checkbox" 
                        checked={advDiacriticsSorting}
                        onChange={(e) => setAdvDiacriticsSorting(e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-slate-300"
                      />
                      <span className="text-[11px] font-bold text-slate-600">
                        Sort diacritics and accented characters
                      </span>
                    </label>

                    <div className="space-y-1 border-t border-slate-100/55 pt-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block font-sans">Date format</label>
                      <input 
                        type="text" 
                        value={advDateFormat}
                        onChange={(e) => setAdvDateFormat(e.target.value)}
                        placeholder="F j, Y"
                        className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-[11px] font-semibold text-slate-700 outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="space-y-1 border-t border-slate-100/55 pt-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block font-sans">No products message</label>
                      <input 
                        type="text" 
                        value={advNoProductsMsg}
                        onChange={(e) => setAdvNoProductsMsg(e.target.value)}
                        placeholder="No products found."
                        className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-[11px] font-semibold text-slate-700 outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="space-y-1 border-t border-slate-100/55 pt-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block font-sans">No products filtered message</label>
                      <input 
                        type="text" 
                        value={advNoProductsFilteredMsg}
                        onChange={(e) => setAdvNoProductsFilteredMsg(e.target.value)}
                        placeholder="No products match your search filters."
                        className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-[11px] font-semibold text-slate-700 outline-none focus:border-blue-500"
                      />
                    </div>

                  </div>
                </div>

                {/* G. UNINSTALLING */}
                <div className="space-y-3">
                  <span className="text-[11px] font-black text-slate-800 uppercase tracking-wider block font-sans">Uninstalling Product Table</span>
                  <div className="bg-slate-50/40 border border-slate-100 rounded-2xl p-4 text-xs font-bold text-slate-655">
                    <label className="flex items-start gap-2.5 cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={advDeleteDataOnUninstall}
                        onChange={(e) => setAdvDeleteDataOnUninstall(e.target.checked)}
                        className="w-4 h-4 rounded text-rose-600 border-slate-350 mt-0.5"
                      />
                      <span className="text-[11px] font-bold text-slate-600 leading-snug">
                        Permanently delete all WooCommerce Product Table settings and data when uninstalling the plugin
                      </span>
                    </label>
                  </div>
                </div>

                {/* H. REAL-TIME CUSTOM CSS FIELD (STYLISH) */}
                <div className="space-y-3">
                  <span className="text-[11px] font-black text-slate-800 uppercase tracking-wider block font-sans">Custom CSS Stylesheet</span>
                  <div className="bg-slate-900 border border-slate-950 rounded-2xl p-4 space-y-3 shadow-inner">
                    <div className="flex justify-between items-center">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global CSS Overrides</h4>
                      <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest font-sans">Active Live</span>
                    </div>
                    <textarea 
                      value={advCustomCss}
                      onChange={(e) => setAdvCustomCss(e.target.value)}
                      placeholder="/* Enter your custom table style overrides here */"
                      className="w-full h-44 bg-slate-950 border border-slate-800 rounded-xl p-3 text-[10px] font-mono text-slate-300 outline-none focus:border-slate-700"
                    />
                    <p className="text-[9px] text-slate-500 leading-normal font-semibold">
                      Target classes like <code className="bg-slate-950/80 px-1 py-0.5 rounded text-blue-400 font-sans">.wise-product-table-preview</code> to write CSS overrides!
                    </p>
                  </div>
                </div>

              </div>
            )}
            </>
            )}
          </div>
        </aside>

        {/* Right Side Live Interactive Preview Area */}
        <main className="flex-1 bg-slate-100 p-8 flex items-center justify-center overflow-y-auto relative">
          
          {/* Simulated Browser Frame */}
          <div 
            className="bg-white rounded-2xl shadow-xl border border-slate-200/60 overflow-hidden flex flex-col transition-all duration-500 ease-out"
            style={{ 
              width: viewport === 'desktop' ? '100%' : '380px', 
              minHeight: '520px',
              maxWidth: viewport === 'desktop' ? '920px' : '380px'
            }}
          >
            {/* Browser Header controls */}
            <div className="h-10 bg-slate-50/50 border-b border-slate-100 px-4 flex items-center gap-4 shrink-0 justify-between">
              {/* Colored Dots */}
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-400"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
              </div>

              {/* Simulated Address Bar */}
              <div className="bg-white border border-slate-100/60 rounded-lg px-3 py-1 flex items-center gap-1.5 text-[10px] text-slate-400 font-bold max-w-xs w-full mx-auto justify-center shadow-2xs">
                <span className="text-slate-300">🔒</span>
                <span className="text-slate-500">mystore.com</span>
                <span className="text-slate-300">/products/catalog</span>
              </div>

              {/* Spacer */}
              <div className="w-10"></div>
            </div>

            {/* Simulated Page Content */}
            <div className="flex-1 p-5 overflow-y-auto bg-white flex flex-col wise-product-table-preview">
              {renderTableContent()}
            </div>
          </div>

        </main>
      </div>

      {/* Multi-Step Add New Table Wizard Modal */}
      {isAddTableWizardOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 md:p-4 overflow-y-auto">
          <div className="bg-slate-50 rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 flex flex-col overflow-hidden my-auto max-h-[92vh] animate-in fade-in zoom-in duration-200">
            
            {/* Top Navigation Bar */}
            <div className="bg-white border-b border-slate-200 px-4 md:px-6 py-2.5 flex items-center justify-between overflow-x-auto gap-3 shrink-0 shadow-sm">
              {[
                { step: 1, label: 'Create' },
                { step: 2, label: 'Content' },
                { step: 3, label: 'Columns' },
                { step: 4, label: 'Add to Cart' },
                { step: 5, label: 'Performance' },
                { step: 6, label: 'Search & Sort' },
                { step: 7, label: 'Ready' }
              ].map((s) => {
                const isCompleted = wizardStep > s.step;
                const isCurrent = wizardStep === s.step;
                return (
                  <div key={s.step} className="flex items-center gap-1.5 shrink-0">
                    <div 
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black transition-all ${
                        isCompleted ? 'bg-blue-600 text-white shadow-sm' : 
                        isCurrent ? 'bg-blue-600 text-white ring-2 ring-blue-100 shadow-sm' : 
                        'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {isCompleted ? <Check className="w-3 h-3 stroke-[3]" /> : s.step}
                    </div>
                    <span className={`text-[11px] font-bold tracking-wide ${isCurrent ? 'text-slate-900 font-extrabold' : isCompleted ? 'text-slate-700' : 'text-slate-400'}`}>
                      {s.label}
                    </span>
                    {s.step < 7 && <span className="w-4 h-px bg-slate-200 ml-1"></span>}
                  </div>
                );
              })}
            </div>

            {/* Wizard Body Content */}
            <div className="p-4 md:p-6 flex-1 overflow-y-auto flex flex-col items-center justify-center max-w-xl mx-auto w-full scrollbar-thin">
              
              {/* STEP 1: CREATE */}
              {wizardStep === 1 && (
                <div className="w-full space-y-4">
                  <div className="text-center space-y-0.5 mb-2">
                    <h2 className="text-xl font-black text-slate-800 tracking-tight">Create a table</h2>
                  </div>

                  <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-slate-800 block">Table name</label>
                      <input 
                        type="text" 
                        value={wizardTableName} 
                        onChange={(e) => setWizardTableName(e.target.value)}
                        placeholder="Name" 
                        className="w-full px-3 py-2 bg-white border border-slate-250 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:border-blue-500 shadow-sm"
                      />
                      <p className="text-[10px] text-slate-450 font-medium leading-normal pt-0.5">
                        Give your table a name to help you identify it later (e.g. "Products in the Clothing category")
                      </p>
                    </div>

                    <div className="space-y-2.5 pt-3 border-t border-slate-100">
                      <label className="text-xs font-black text-slate-800 block mb-2">How do you want to add the table to your store?</label>
                      
                      <label className="flex items-start gap-2.5 cursor-pointer p-1 select-none">
                        <input 
                          type="radio" 
                          name="wizardAddMethod" 
                          checked={wizardAddMethod === 'shortcode'}
                          onChange={() => setWizardAddMethod('shortcode')}
                          className="w-3.5 h-3.5 text-blue-600 border-slate-300 mt-0.5"
                        />
                        <span className="text-xs font-bold text-slate-800">Add to a page using a block or shortcode</span>
                      </label>

                      <label className="flex items-start gap-2.5 cursor-pointer p-1 select-none">
                        <input 
                          type="radio" 
                          name="wizardAddMethod" 
                          checked={wizardAddMethod === 'shop_page'}
                          onChange={() => setWizardAddMethod('shop_page')}
                          className="w-3.5 h-3.5 text-blue-600 border-slate-300 mt-0.5"
                        />
                        <span className="text-xs font-bold text-slate-800">Display on a shop page (e.g. main storefront, category page, etc.)</span>
                      </label>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex justify-center">
                      <button 
                        onClick={() => {
                          if (!wizardTableName.trim()) {
                            triggerToast('Please enter a table name! ⚠️', 'warning');
                            return;
                          }
                          setWizardStep(2);
                        }}
                        className="px-8 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black tracking-wider uppercase shadow-md transition-all hover:scale-[1.02]"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: CONTENT */}
              {wizardStep === 2 && (
                <div className="w-full space-y-4">
                  <div className="text-center space-y-0.5 mb-2">
                    <h2 className="text-xl font-black text-slate-800 tracking-tight">Select your products</h2>
                  </div>

                  <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-800 block mb-2">Which products do you want to display?</label>
                      
                      <label className="flex items-center gap-2.5 cursor-pointer p-0.5 select-none">
                        <input 
                          type="radio" 
                          name="wizardProductSource" 
                          checked={wizardProductSource === 'all'}
                          onChange={() => setWizardProductSource('all')}
                          className="w-3.5 h-3.5 text-blue-600 border-slate-300"
                        />
                        <span className="text-xs font-bold text-slate-800">All products</span>
                      </label>

                      <label className="flex items-center gap-2.5 cursor-pointer p-0.5 select-none">
                        <input 
                          type="radio" 
                          name="wizardProductSource" 
                          checked={wizardProductSource === 'specific'}
                          onChange={() => setWizardProductSource('specific')}
                          className="w-3.5 h-3.5 text-blue-600 border-slate-300"
                        />
                        <span className="text-xs font-bold text-slate-800">Select specific products</span>
                      </label>
                    </div>

                    {wizardProductSource === 'specific' && (
                      <div className="space-y-2.5 pt-3 border-t border-slate-100 pl-2 max-h-72 overflow-y-auto pr-2">
                        {/* Categories */}
                        <div className="space-y-1.5 bg-slate-50/50 p-2.5 rounded-xl border border-slate-150">
                          <label className="flex items-center gap-2.5 cursor-pointer select-none">
                            <input 
                              type="checkbox" 
                              checked={wizardCatChecked}
                              onChange={(e) => setWizardCatChecked(e.target.checked)}
                              className="w-3.5 h-3.5 rounded text-blue-600 border-slate-300" 
                            />
                            <span className="text-xs font-bold text-slate-800">Filter by Categories</span>
                          </label>
                          {wizardCatChecked && (
                            <div className="flex flex-wrap gap-1.5 pt-1 pl-6">
                              {(storeCategories.length > 0 ? storeCategories.map(c => c.name) : ['Accessories', 'Hoodies', 'T-shirts', 'Apparel', 'Music', 'Decor', 'Uncategorized']).map(cat => {
                                const isSelected = wizardCategories.includes(cat);
                                return (
                                  <button
                                    key={cat}
                                    type="button"
                                    onClick={() => {
                                      if (isSelected) {
                                        if (wizardCategories.length > 1) { setWizardCategories(wizardCategories.filter(c => c !== cat)); }
                                        else { triggerToast('Keep at least one category selected! ⚠️', 'warning'); }
                                      } else { setWizardCategories([...wizardCategories, cat]); }
                                    }}
                                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 ${isSelected ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-100' : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'}`}
                                  >
                                    {isSelected ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : <Plus className="w-2.5 h-2.5" />} {cat}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        {/* Tags */}
                        <div className="space-y-1.5 bg-slate-50/50 p-2.5 rounded-xl border border-slate-150">
                          <label className="flex items-center gap-2.5 cursor-pointer select-none">
                            <input 
                              type="checkbox" 
                              checked={wizardTagChecked}
                              onChange={(e) => setWizardTagChecked(e.target.checked)}
                              className="w-3.5 h-3.5 rounded text-blue-600 border-slate-300" 
                            />
                            <span className="text-xs font-bold text-slate-800">Filter by Tags</span>
                          </label>
                          {wizardTagChecked && (
                            <div className="flex flex-wrap gap-1.5 pt-1 pl-6">
                              {(storeTags.length > 0 ? storeTags.map(t => t.name) : uniqueTags.length > 0 ? uniqueTags : ['Standard', 'Featured', 'New', 'Sale', 'Popular']).map(tag => {
                                const isSelected = wizardTags.includes(tag);
                                return (
                                  <button
                                    key={tag}
                                    type="button"
                                    onClick={() => {
                                      if (isSelected) { setWizardTags(wizardTags.filter(t => t !== tag)); }
                                      else { setWizardTags([...wizardTags, tag]); }
                                    }}
                                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 ${isSelected ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-100' : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'}`}
                                  >
                                    {isSelected ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : <Plus className="w-2.5 h-2.5" />} {tag}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        {/* Individual Products */}
                        <div className="space-y-1.5 bg-slate-50/50 p-2.5 rounded-xl border border-slate-150">
                          <label className="flex items-center gap-2.5 cursor-pointer select-none">
                            <input 
                              type="checkbox" 
                              checked={wizardProdChecked}
                              onChange={(e) => setWizardProdChecked(e.target.checked)}
                              className="w-3.5 h-3.5 rounded text-blue-600 border-slate-300" 
                            />
                            <span className="text-xs font-bold text-slate-800">Filter by Individual Products</span>
                          </label>
                          {wizardProdChecked && (
                            <div className="flex flex-wrap gap-1.5 pt-1 pl-6 max-h-28 overflow-y-auto pr-1">
                              {(storeProducts.length > 0 ? storeProducts.map(p => p.name) : products.length > 0 ? products.map(p => p.name) : ['Premium Hoodie', 'Classic T-Shirt', 'Smart Watch', 'Wireless Earbuds', 'Leather Wallet']).map(prodName => {
                                const isSelected = wizardProds.includes(prodName);
                                return (
                                  <button
                                    key={prodName}
                                    type="button"
                                    onClick={() => {
                                      if (isSelected) { setWizardProds(wizardProds.filter(p => p !== prodName)); }
                                      else { setWizardProds([...wizardProds, prodName]); }
                                    }}
                                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 ${isSelected ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-100' : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'}`}
                                  >
                                    {isSelected ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : <Plus className="w-2.5 h-2.5" />} {prodName}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        {/* Custom Fields */}
                        <div className="space-y-1.5 bg-slate-50/50 p-2.5 rounded-xl border border-slate-150">
                          <label className="flex items-center gap-2.5 cursor-pointer select-none">
                            <input 
                              type="checkbox" 
                              checked={wizardFieldChecked}
                              onChange={(e) => setWizardFieldChecked(e.target.checked)}
                              className="w-3.5 h-3.5 rounded text-blue-600 border-slate-300" 
                            />
                            <span className="text-xs font-bold text-slate-800">Filter by Custom Fields</span>
                          </label>
                          {wizardFieldChecked && (
                            <div className="flex flex-wrap gap-1.5 pt-1 pl-6">
                              {(storeFields.length > 0 ? storeFields : ['_featured', '_sale_price', '_manage_stock', '_downloadable', '_virtual']).map(field => {
                                const isSelected = wizardFields.includes(field);
                                return (
                                  <button
                                    key={field}
                                    type="button"
                                    onClick={() => {
                                      if (isSelected) { setWizardFields(wizardFields.filter(f => f !== field)); }
                                      else { setWizardFields([...wizardFields, field]); }
                                    }}
                                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 ${isSelected ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-100' : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'}`}
                                  >
                                    {isSelected ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : <Plus className="w-2.5 h-2.5" />} {field}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        {/* Color */}
                        <div className="space-y-1.5 bg-slate-50/50 p-2.5 rounded-xl border border-slate-150">
                          <label className="flex items-center gap-2.5 cursor-pointer select-none">
                            <input 
                              type="checkbox" 
                              checked={wizardColorChecked}
                              onChange={(e) => setWizardColorChecked(e.target.checked)}
                              className="w-3.5 h-3.5 rounded text-blue-600 border-slate-300" 
                            />
                            <span className="text-xs font-bold text-slate-800">Filter by Color</span>
                          </label>
                          {wizardColorChecked && (
                            <div className="flex flex-wrap gap-1.5 pt-1 pl-6">
                              {(storeColors.length > 0 ? storeColors : uniqueColors.length > 0 ? uniqueColors : ['Black', 'Blue', 'Red', 'White', 'Grey', 'Green']).map(color => {
                                const isSelected = wizardColors.includes(color);
                                return (
                                  <button
                                    key={color}
                                    type="button"
                                    onClick={() => {
                                      if (isSelected) { setWizardColors(wizardColors.filter(c => c !== color)); }
                                      else { setWizardColors([...wizardColors, color]); }
                                    }}
                                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 ${isSelected ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-100' : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'}`}
                                  >
                                    {isSelected ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : <Plus className="w-2.5 h-2.5" />} {color}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        {/* Size */}
                        <div className="space-y-1.5 bg-slate-50/50 p-2.5 rounded-xl border border-slate-150">
                          <label className="flex items-center gap-2.5 cursor-pointer select-none">
                            <input 
                              type="checkbox" 
                              checked={wizardSizeChecked}
                              onChange={(e) => setWizardSizeChecked(e.target.checked)}
                              className="w-3.5 h-3.5 rounded text-blue-600 border-slate-300" 
                            />
                            <span className="text-xs font-bold text-slate-800">Filter by Size</span>
                          </label>
                          {wizardSizeChecked && (
                            <div className="flex flex-wrap gap-1.5 pt-1 pl-6">
                              {(storeSizes.length > 0 ? storeSizes : uniqueSizes.length > 0 ? uniqueSizes : ['XS', 'S', 'M', 'L', 'XL', 'XXL']).map(size => {
                                const isSelected = wizardSizes.includes(size);
                                return (
                                  <button
                                    key={size}
                                    type="button"
                                    onClick={() => {
                                      if (isSelected) { setWizardSizes(wizardSizes.filter(s => s !== size)); }
                                      else { setWizardSizes([...wizardSizes, size]); }
                                    }}
                                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 ${isSelected ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-100' : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'}`}
                                  >
                                    {isSelected ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : <Plus className="w-2.5 h-2.5" />} {size}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        {/* Product Type */}
                        <div className="space-y-1.5 bg-slate-50/50 p-2.5 rounded-xl border border-slate-150">
                          <label className="flex items-center gap-2.5 cursor-pointer select-none">
                            <input 
                              type="checkbox" 
                              checked={wizardTypeChecked}
                              onChange={(e) => setWizardTypeChecked(e.target.checked)}
                              className="w-3.5 h-3.5 rounded text-blue-600 border-slate-300" 
                            />
                            <span className="text-xs font-bold text-slate-800">Filter by Product Type</span>
                          </label>
                          {wizardTypeChecked && (
                            <div className="flex flex-wrap gap-1.5 pt-1 pl-6">
                              {(storeTypes.length > 0 ? storeTypes : ['simple', 'variable', 'external', 'grouped']).map(type => {
                                const isSelected = wizardTypes.includes(type);
                                return (
                                  <button
                                    key={type}
                                    type="button"
                                    onClick={() => {
                                      if (isSelected) { setWizardTypes(wizardTypes.filter(t => t !== type)); }
                                      else { setWizardTypes([...wizardTypes, type]); }
                                    }}
                                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 ${isSelected ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-100' : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'}`}
                                  >
                                    {isSelected ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : <Plus className="w-2.5 h-2.5" />} {type}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        {/* Status */}
                        <div className="space-y-1.5 bg-slate-50/50 p-2.5 rounded-xl border border-slate-150">
                          <label className="flex items-center gap-2.5 cursor-pointer select-none">
                            <input 
                              type="checkbox" 
                              checked={wizardStatusChecked}
                              onChange={(e) => setWizardStatusChecked(e.target.checked)}
                              className="w-3.5 h-3.5 rounded text-blue-600 border-slate-300" 
                            />
                            <span className="text-xs font-bold text-slate-800">Filter by Status</span>
                          </label>
                          {wizardStatusChecked && (
                            <div className="flex flex-wrap gap-1.5 pt-1 pl-6">
                              {(storeStatuses.length > 0 ? storeStatuses : ['publish', 'pending', 'draft', 'private']).map(status => {
                                const isSelected = wizardStatuses.includes(status);
                                return (
                                  <button
                                    key={status}
                                    type="button"
                                    onClick={() => {
                                      if (isSelected) { setWizardStatuses(wizardStatuses.filter(s => s !== status)); }
                                      else { setWizardStatuses([...wizardStatuses, status]); }
                                    }}
                                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 ${isSelected ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-100' : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'}`}
                                  >
                                    {isSelected ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : <Plus className="w-2.5 h-2.5" />} {status}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        {/* Stock */}
                        <div className="space-y-1.5 bg-slate-50/50 p-2.5 rounded-xl border border-slate-150">
                          <label className="flex items-center gap-2.5 cursor-pointer select-none">
                            <input 
                              type="checkbox" 
                              checked={wizardStockChecked}
                              onChange={(e) => setWizardStockChecked(e.target.checked)}
                              className="w-3.5 h-3.5 rounded text-blue-600 border-slate-300" 
                            />
                            <span className="text-xs font-bold text-slate-800">Filter by Stock Status</span>
                          </label>
                          {wizardStockChecked && (
                            <div className="flex flex-wrap gap-1.5 pt-1 pl-6">
                              {(storeStocks.length > 0 ? storeStocks : ['in_stock', 'out_of_stock', 'on_backorder']).map(stock => {
                                const isSelected = wizardStocks.includes(stock);
                                return (
                                  <button
                                    key={stock}
                                    type="button"
                                    onClick={() => {
                                      if (isSelected) { setWizardStocks(wizardStocks.filter(s => s !== stock)); }
                                      else { setWizardStocks([...wizardStocks, stock]); }
                                    }}
                                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 ${isSelected ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-100' : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'}`}
                                  >
                                    {isSelected ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : <Plus className="w-2.5 h-2.5" />} {stock.replace(/_/g, ' ')}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="pt-4 border-t border-slate-100 flex justify-center gap-3">
                      <button 
                        onClick={() => setWizardStep(1)}
                        className="px-6 py-2 bg-white hover:bg-slate-50 border border-blue-600 text-blue-600 rounded-xl text-xs font-black tracking-wider uppercase shadow-sm transition-all"
                      >
                        Back
                      </button>
                      <button 
                        onClick={() => setWizardStep(3)}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black tracking-wider uppercase shadow-md transition-all hover:scale-[1.02]"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: COLUMNS */}
              {wizardStep === 3 && (
                <div className="w-full space-y-4">
                  <div className="text-center space-y-0.5 mb-2">
                    <h2 className="text-xl font-black text-slate-800 tracking-tight">Table columns</h2>
                    <p className="text-[11px] text-slate-450 font-semibold">Choose which columns to display in the table.</p>
                  </div>

                  <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-3">
                    <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                      {wizardColumns.map((col) => (
                        <div key={col.id} className="border border-slate-200 rounded-xl p-3 bg-slate-50/40 space-y-3 shadow-sm transition-all">
                          <div className="flex items-center justify-between gap-2">
                            <div 
                              onClick={() => setWizardColumns(prev => prev.map(c => c.id === col.id ? { ...c, expanded: !c.expanded } : c))}
                              className="flex items-center gap-2 flex-1 cursor-pointer select-none"
                            >
                              <GripVertical className="w-3.5 h-3.5 text-slate-400 cursor-grab shrink-0" onClick={(e) => e.stopPropagation()} />
                              <span className="text-xs font-black text-slate-800 flex-1 flex items-center gap-1.5">
                                {col.name} {col.expanded ? <ChevronDown className="w-3 h-3 text-slate-400" /> : <ChevronRight className="w-3 h-3 text-slate-400" />}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className="text-[9px] font-black text-slate-500 bg-slate-200/70 px-2 py-0.5 rounded uppercase tracking-wider">
                                {col.badge}
                              </span>
                              <button 
                                onClick={() => setWizardColumns(prev => prev.filter(c => c.id !== col.id))}
                                className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {col.expanded && (
                            <div className="pt-3 border-t border-slate-200/80 space-y-3 pl-6 text-xs font-bold text-slate-700 animate-fadeIn">
                              <div className="space-y-2">
                                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                                  <input 
                                    type="checkbox" 
                                    checked={col.addLink !== false} 
                                    onChange={(e) => setWizardColumns(prev => prev.map(c => c.id === col.id ? { ...c, addLink: e.target.checked } : c))}
                                    className="w-3.5 h-3.5 rounded text-blue-600 border-slate-300" 
                                  />
                                  <span className="text-xs font-bold text-slate-800">Add a link</span>
                                </label>

                                {col.addLink !== false && (
                                  <div className="pl-6 space-y-1.5">
                                    <label className="flex items-center gap-2.5 cursor-pointer select-none">
                                      <input 
                                        type="radio" 
                                        name={`linkType_${col.id}`} 
                                        checked={col.linkType === 'lightbox'}
                                        onChange={() => setWizardColumns(prev => prev.map(c => c.id === col.id ? { ...c, linkType: 'lightbox' } : c))}
                                        className="w-3.5 h-3.5 text-blue-600 border-slate-300" 
                                      />
                                      <span className="text-[11px] font-semibold text-slate-700">Displays product image in a lightbox</span>
                                    </label>
                                    <label className="flex items-center gap-2.5 cursor-pointer select-none">
                                      <input 
                                        type="radio" 
                                        name={`linkType_${col.id}`} 
                                        checked={col.linkType !== 'lightbox'}
                                        onChange={() => setWizardColumns(prev => prev.map(c => c.id === col.id ? { ...c, linkType: 'page' } : c))}
                                        className="w-3.5 h-3.5 text-blue-600 border-slate-300" 
                                      />
                                      <span className="text-[11px] font-semibold text-slate-700">To the product page</span>
                                    </label>
                                  </div>
                                )}
                              </div>

                              <div className="pt-2.5 border-t border-slate-150 space-y-2.5">
                                <span 
                                  onClick={() => setWizardColumns(prev => prev.map(c => c.id === col.id ? { ...c, showAdv: !c.showAdv } : c))}
                                  className="text-[11px] font-extrabold text-blue-600 block cursor-pointer flex items-center gap-1 select-none"
                                >
                                  Advanced settings {col.showAdv ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                                </span>

                                {col.showAdv && (
                                  <div className="space-y-3 pt-1 animate-fadeIn">
                                    <label className="flex items-center gap-2.5 cursor-pointer select-none">
                                      <input 
                                        type="checkbox" 
                                        checked={col.showHeading !== false}
                                        onChange={(e) => setWizardColumns(prev => prev.map(c => c.id === col.id ? { ...c, showHeading: e.target.checked } : c))}
                                        className="w-3.5 h-3.5 rounded text-blue-600 border-slate-300" 
                                      />
                                      <span className="text-[11px] font-bold text-slate-800">Show column heading</span>
                                    </label>

                                    <div className="space-y-1">
                                      <label className="text-[11px] font-bold text-slate-800 block">Column width</label>
                                      <div className="flex items-center gap-1.5">
                                        <input 
                                          type="text" 
                                          placeholder="auto" 
                                          value={col.width || ''}
                                          onChange={(e) => setWizardColumns(prev => prev.map(c => c.id === col.id ? { ...c, width: e.target.value } : c))}
                                          className="w-20 px-2.5 py-1 bg-white border border-slate-250 rounded-lg text-xs font-semibold outline-none focus:border-blue-500" 
                                        />
                                        <button 
                                          type="button"
                                          onClick={() => setWizardColumns(prev => prev.map(c => c.id === col.id ? { ...c, widthUnit: '%' } : c))}
                                          className={`px-2 py-1 rounded-md text-xs font-black transition-all ${col.widthUnit !== 'px' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white border border-slate-250 text-slate-600 hover:bg-slate-50'}`}
                                        >
                                          %
                                        </button>
                                        <button 
                                          type="button"
                                          onClick={() => setWizardColumns(prev => prev.map(c => c.id === col.id ? { ...c, widthUnit: 'px' } : c))}
                                          className={`px-2 py-1 rounded-md text-xs font-black transition-all ${col.widthUnit === 'px' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white border border-slate-250 text-slate-600 hover:bg-slate-50'}`}
                                        >
                                          px
                                        </button>
                                      </div>
                                    </div>

                                    <div className="space-y-1">
                                      <label className="text-[11px] font-bold text-slate-800 block">Responsive visibility</label>
                                      <select 
                                        value={col.respVis || 'default'}
                                        onChange={(e) => setWizardColumns(prev => prev.map(c => c.id === col.id ? { ...c, respVis: e.target.value } : c))}
                                        className="w-full px-2.5 py-1 bg-white border border-slate-250 rounded-lg text-xs font-semibold outline-none focus:border-blue-500"
                                      >
                                        <option value="default">default</option>
                                        <option value="desktop only">desktop only</option>
                                        <option value="mobile only">mobile only</option>
                                      </select>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2 pt-2 border-t border-slate-100">
                      <select 
                        value={wizardNewCol} 
                        onChange={(e) => setWizardNewCol(e.target.value)}
                        className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:border-blue-500"
                      >
                        <option value="stock">Stock</option>
                        <option value="rating">Rating</option>
                        <option value="sku">SKU</option>
                        <option value="categories">Categories</option>
                        <option value="tags">Tags</option>
                      </select>
                      <button 
                        onClick={() => {
                          if (wizardColumns.some(c => c.id === wizardNewCol)) {
                            triggerToast('Column is already added! ⚠️', 'warning');
                          } else {
                            const nameMap = { stock: 'Stock', rating: 'Rating', sku: 'SKU', categories: 'Categories', tags: 'Tags' };
                            setWizardColumns(prev => [...prev, { id: wizardNewCol, name: nameMap[wizardNewCol], badge: wizardNewCol, expanded: true, addLink: true, linkType: 'page', showHeading: true, width: '', widthUnit: '%', respVis: 'default', showAdv: false }]);
                            triggerToast(`Added ${nameMap[wizardNewCol]} column! ✨`, 'success');
                          }
                        }}
                        className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-black uppercase tracking-wider transition-colors shadow-sm"
                      >
                        Add
                      </button>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex justify-center gap-3">
                      <button 
                        onClick={() => setWizardStep(2)}
                        className="px-6 py-2 bg-white hover:bg-slate-50 border border-blue-600 text-blue-600 rounded-xl text-xs font-black tracking-wider uppercase shadow-sm transition-all"
                      >
                        Back
                      </button>
                      <button 
                        onClick={() => setWizardStep(4)}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black tracking-wider uppercase shadow-md transition-all hover:scale-[1.02]"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: ADD TO CART */}
              {wizardStep === 4 && (
                <div className="w-full space-y-4">
                  <div className="text-center space-y-0.5 mb-2">
                    <h2 className="text-xl font-black text-slate-800 tracking-tight">Add to Cart</h2>
                  </div>

                  <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-slate-800 block">Add to cart method</label>
                      <select 
                        value={wizardCartMethod} 
                        onChange={(e) => setWizardCartMethod(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-250 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:border-blue-500 shadow-sm"
                      >
                        <option value="Cart buttons">Cart buttons</option>
                        <option value="Checkbox only">Checkbox only</option>
                        <option value="Button & Checkbox">Button & Checkbox</option>
                      </select>
                    </div>

                    <div className="space-y-1.5 pt-3 border-t border-slate-100">
                      <label className="text-xs font-black text-slate-800 block mb-1">Quantities</label>
                      <label className="flex items-center gap-2.5 cursor-pointer select-none">
                        <input 
                          type="checkbox" 
                          checked={wizardShowQty} 
                          onChange={(e) => setWizardShowQty(e.target.checked)}
                          className="w-3.5 h-3.5 rounded text-blue-600 border-slate-300" 
                        />
                        <span className="text-xs font-bold text-slate-800">Show a quantity picker for each product</span>
                      </label>
                    </div>

                    <div className="space-y-1.5 pt-3 border-t border-slate-100">
                      <label className="text-xs font-black text-slate-800 block">Variations</label>
                      <select 
                        value={wizardVarMethod} 
                        onChange={(e) => setWizardVarMethod(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-250 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:border-blue-500 shadow-sm"
                      >
                        <option value="Show as dropdown lists">Show as dropdown lists</option>
                        <option value="Separate rows">Separate rows</option>
                        <option value="Popup modal">Popup modal</option>
                      </select>
                      <p className="text-[10px] text-slate-450 font-medium leading-normal pt-0.5">
                        How to display the options for variable products. <span className="text-blue-600 underline cursor-pointer">Read more</span>
                      </p>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex justify-center gap-3">
                      <button 
                        onClick={() => setWizardStep(3)}
                        className="px-6 py-2 bg-white hover:bg-slate-50 border border-blue-600 text-blue-600 rounded-xl text-xs font-black tracking-wider uppercase shadow-sm transition-all"
                      >
                        Back
                      </button>
                      <button 
                        onClick={() => setWizardStep(5)}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black tracking-wider uppercase shadow-md transition-all hover:scale-[1.02]"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 5: PERFORMANCE */}
              {wizardStep === 5 && (
                <div className="w-full space-y-4">
                  <div className="text-center space-y-0.5 mb-2">
                    <h2 className="text-xl font-black text-slate-800 tracking-tight">Performance</h2>
                    <p className="text-[11px] text-slate-450 font-semibold">Optimize your table load times.</p>
                  </div>

                  <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-800 block mb-1">Lazy load</label>
                      <label className="flex items-start gap-2.5 cursor-pointer select-none">
                        <input 
                          type="checkbox" 
                          checked={wizardLazyLoad} 
                          onChange={(e) => setWizardLazyLoad(e.target.checked)}
                          className="w-3.5 h-3.5 rounded text-blue-600 border-slate-300 mt-0.5" 
                        />
                        <div className="space-y-0.5">
                          <span className="text-xs font-bold text-slate-800 block">Load table one page at a time</span>
                          <p className="text-[10px] text-slate-450 font-medium leading-normal">
                            Enable this if you have many products or experience slow page load times. Lazy load has <span className="text-blue-600 underline cursor-pointer">some limitations</span> for the search, sorting and filters.
                          </p>
                        </div>
                      </label>
                    </div>

                    <div className="space-y-1.5 pt-3 border-t border-slate-100">
                      <label className="text-xs font-black text-slate-800 block">Product limit</label>
                      <input 
                        type="text" 
                        value={wizardProdLimit} 
                        onChange={(e) => setWizardProdLimit(e.target.value)}
                        className="w-28 px-3 py-2 bg-white border border-slate-250 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:border-blue-500 shadow-sm"
                      />
                      <p className="text-[10px] text-slate-450 font-medium leading-normal pt-0.5">
                        The maximum number of products in one table.
                      </p>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex justify-center gap-3">
                      <button 
                        onClick={() => setWizardStep(4)}
                        className="px-6 py-2 bg-white hover:bg-slate-50 border border-blue-600 text-blue-600 rounded-xl text-xs font-black tracking-wider uppercase shadow-sm transition-all"
                      >
                        Back
                      </button>
                      <button 
                        onClick={() => setWizardStep(6)}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black tracking-wider uppercase shadow-md transition-all hover:scale-[1.02]"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 6: SEARCH & SORT */}
              {wizardStep === 6 && (
                <div className="w-full space-y-4">
                  <div className="text-center space-y-0.5 mb-2">
                    <h2 className="text-xl font-black text-slate-800 tracking-tight">Search & Sort</h2>
                    <p className="text-[11px] text-slate-450 font-semibold">Configure how customers find and sort products.</p>
                  </div>

                  <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
                    <div className="space-y-2.5">
                      <label className="flex items-center gap-2.5 cursor-pointer select-none">
                        <input 
                          type="checkbox" 
                          checked={wizardShowSearch} 
                          onChange={(e) => setWizardShowSearch(e.target.checked)}
                          className="w-3.5 h-3.5 rounded text-blue-600 border-slate-300" 
                        />
                        <span className="text-xs font-bold text-slate-800">Show search box above table</span>
                      </label>

                      <label className="flex items-center gap-2.5 cursor-pointer select-none pt-1">
                        <input 
                          type="checkbox" 
                          checked={wizardShowFilters} 
                          onChange={(e) => setWizardShowFilters(e.target.checked)}
                          className="w-3.5 h-3.5 rounded text-blue-600 border-slate-300" 
                        />
                        <span className="text-xs font-bold text-slate-800">Show category & color filter dropdowns</span>
                      </label>
                    </div>

                    <div className="space-y-1.5 pt-3 border-t border-slate-100">
                      <label className="text-xs font-black text-slate-800 block">Default sorting</label>
                      <select 
                        value={wizardSortBy} 
                        onChange={(e) => setWizardSortBy(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-250 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:border-blue-500 shadow-sm"
                      >
                        <option value="Default menu order">Default menu order</option>
                        <option value="Popularity (sales)">Popularity (sales)</option>
                        <option value="Average rating">Average rating</option>
                        <option value="Latest products">Latest products</option>
                        <option value="Price: low to high">Price: low to high</option>
                        <option value="Price: high to low">Price: high to low</option>
                      </select>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex justify-center gap-3">
                      <button 
                        onClick={() => setWizardStep(5)}
                        className="px-6 py-2 bg-white hover:bg-slate-50 border border-blue-600 text-blue-600 rounded-xl text-xs font-black tracking-wider uppercase shadow-sm transition-all"
                      >
                        Back
                      </button>
                      <button 
                        onClick={() => setWizardStep(7)}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black tracking-wider uppercase shadow-md transition-all hover:scale-[1.02]"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 7: READY */}
              {wizardStep === 7 && (
                <div className="w-full space-y-4">
                  <div className="text-center space-y-1 mb-4">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-2 shadow-sm animate-bounce">
                      <Check className="w-6 h-6 stroke-[3]" />
                    </div>
                    <h2 className="text-xl font-black text-slate-800 tracking-tight">🎉 Your Table is Ready!</h2>
                    <p className="text-[11px] text-slate-450 font-semibold max-w-md mx-auto">
                      You have successfully configured your new product table. You can now insert it into any WordPress post, page, or Elementor block.
                    </p>
                  </div>

                  <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4 text-center">
                    <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 shadow-inner space-y-2">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block font-sans">Generated Shortcode</span>
                      <div className="text-base font-mono font-bold text-emerald-400 select-all bg-slate-950 py-2 px-3 rounded-lg border border-slate-800 inline-block mx-auto shadow-md">
                        [product_table id="{savedTablesList.length + 1}"]
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium pt-0.5">
                        Table Name: <span className="text-white font-bold">{wizardTableName || 'Custom Product Table'}</span>
                      </p>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex justify-center gap-3">
                      <button 
                        onClick={() => setWizardStep(6)}
                        className="px-6 py-2.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-xl text-xs font-black tracking-wider uppercase shadow-sm transition-all"
                      >
                        Back
                      </button>
                      <button 
                        onClick={() => {
                          const activeFilters = [];
                          if (wizardProductSource === 'all') {
                            activeFilters.push('All Products');
                          } else {
                            if (wizardCatChecked && wizardCategories.length) activeFilters.push(`Categories: ${wizardCategories.join(', ')}`);
                            if (wizardTagChecked && wizardTags.length) activeFilters.push(`Tags: ${wizardTags.join(', ')}`);
                            if (wizardProdChecked && wizardProds.length) activeFilters.push(`Products: ${wizardProds.join(', ')}`);
                            if (wizardFieldChecked && wizardFields.length) activeFilters.push(`Fields: ${wizardFields.join(', ')}`);
                            if (wizardColorChecked && wizardColors.length) activeFilters.push(`Colors: ${wizardColors.join(', ')}`);
                            if (wizardSizeChecked && wizardSizes.length) activeFilters.push(`Sizes: ${wizardSizes.join(', ')}`);
                            if (wizardTypeChecked && wizardTypes.length) activeFilters.push(`Types: ${wizardTypes.join(', ')}`);
                            if (wizardStatusChecked && wizardStatuses.length) activeFilters.push(`Statuses: ${wizardStatuses.join(', ')}`);
                            if (wizardStockChecked && wizardStocks.length) activeFilters.push(`Stock: ${wizardStocks.join(', ')}`);
                          }
                          const displayStr = activeFilters.length ? activeFilters.join(' | ') : 'Specific Products';

                          const newTableObj = {
                            name: wizardTableName || `Custom Table #${savedTablesList.length + 1}`,
                            display: displayStr,
                            shortcode: `[product_table id="${savedTablesList.length + 1}"]`,
                            filter: (p) => {
                              if (wizardProductSource === 'all') return true;
                              let match = true;
                              if (wizardCatChecked && wizardCategories.length && !wizardCategories.includes(p.category)) match = false;
                              if (wizardTagChecked && wizardTags.length && !wizardTags.includes(p.tag)) match = false;
                              if (wizardProdChecked && wizardProds.length && !wizardProds.includes(p.name)) match = false;
                              if (wizardFieldChecked && wizardFields.length && wizardFields.includes('_featured') && !p.featured) match = false;
                              if (wizardColorChecked && wizardColors.length && !wizardColors.includes(p.color)) match = false;
                              if (wizardSizeChecked && wizardSizes.length && !wizardSizes.includes(p.size)) match = false;
                              if (wizardTypeChecked && wizardTypes.length && !wizardTypes.includes(p.type)) match = false;
                              if (wizardStatusChecked && wizardStatuses.length && !wizardStatuses.includes(p.status)) match = false;
                              if (wizardStockChecked && wizardStocks.length) {
                                const stockStatus = p.inStock ? 'in_stock' : 'out_of_stock';
                                if (!wizardStocks.includes(stockStatus)) match = false;
                              }
                              return match;
                            }
                          };
                          setSavedTablesList(prev => [...prev, newTableObj]);
                          setSelectedSavedTable(newTableObj.name);
                          setIsAddTableWizardOpen(false);
                          triggerToast(`Successfully created "${newTableObj.name}"! 🎉`);
                        }}
                        className="px-8 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black tracking-wider uppercase shadow-lg shadow-emerald-100 transition-all hover:scale-[1.02]"
                      >
                        Finish & Insert Table
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Exit Link */}
              <div className="mt-4 text-center">
                <button 
                  onClick={() => setIsAddTableWizardOpen(false)}
                  className="text-[11px] font-bold text-blue-600 hover:text-blue-800 underline transition-colors"
                >
                  Exit
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Change Template Modal */}
      {isTemplateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-200">
            <h3 className="text-base font-extrabold text-slate-800 mb-1">Choose Layout Template</h3>
            <p className="text-xs text-slate-400 mb-6 font-semibold">Select a preset look for your dynamic Product Table module.</p>
            
            <div className="space-y-3 mb-6">
              {[
                { 
                  id: 'lilac-rose', 
                  name: 'Lilac & Soft Rose', 
                  style: 'PREMIUM DESIGN 1', 
                  desc: 'Delicate lavender header, soft pink buttons, and elegant slate text.',
                  headerColor: '#f3f0ff', 
                  btnColor: '#ffe4e6',
                  fontColor: '#991b1b'
                },
                { 
                  id: 'royal-blue', 
                  name: 'Royal Blue Classic', 
                  style: 'PREMIUM DESIGN 2', 
                  desc: 'Vibrant blue header, solid blue buttons, and soft ice-blue alternate rows.',
                  headerColor: '#2563eb', 
                  btnColor: '#2563eb',
                  fontColor: '#ffffff'
                },
                { 
                  id: 'default-table', 
                  name: 'Default Slate Table', 
                  style: 'STANDARD DESIGN', 
                  desc: 'Clean charcoal minimal layout with slate grey accents and solid dark buttons.',
                  headerColor: '#f8fafc', 
                  btnColor: '#0f172a',
                  fontColor: '#ffffff'
                }
              ].map((tpl) => (
                <button 
                  key={tpl.id}
                  onClick={() => applyTemplatePreset(tpl.id)}
                  className={`w-full p-4 border rounded-2xl text-left hover:scale-[1.01] hover:shadow-md transition-all duration-200 flex items-center gap-4 ${activeTemplate.name === tpl.name ? 'border-blue-500 ring-2 ring-blue-100 bg-blue-50/5' : 'border-slate-100 bg-white'}`}
                >
                  {/* Preset Preview Badge */}
                  <div className="w-12 h-12 rounded-xl border border-slate-150 flex flex-col overflow-hidden shrink-0 shadow-sm">
                    <div style={{ backgroundColor: tpl.headerColor }} className="h-5 w-full flex items-center justify-center text-[7px] font-black uppercase text-slate-500">
                      Header
                    </div>
                    <div className="flex-1 bg-white flex items-center justify-center p-1">
                      <div style={{ backgroundColor: tpl.btnColor, color: tpl.fontColor }} className="w-full py-0.5 rounded text-[6px] font-black text-center truncate">
                        Btn
                      </div>
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-black text-slate-700 leading-tight">{tpl.name}</h4>
                      <span className="text-[8px] font-black text-blue-650 bg-blue-50 px-1.5 py-0.5 rounded-md tracking-wider uppercase shrink-0">
                        {tpl.style}
                      </span>
                    </div>
                    <p className="text-[10px] font-semibold text-slate-400 mt-1 leading-normal">
                      {tpl.desc}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex justify-end">
              <button 
                onClick={() => setIsTemplateModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-extrabold text-slate-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
