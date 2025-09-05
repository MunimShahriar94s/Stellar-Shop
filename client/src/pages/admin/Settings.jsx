import { useState, useEffect } from 'react';
import styled from 'styled-components';
import Header from '../../components/admin/Header';
import { useOutletContext } from 'react-router-dom';
import { useSettings } from '../../context/SettingsContext';
import LogoUpload from '../../components/admin/LogoUpload';
import HeroSlidesManager from '../../components/admin/HeroSlidesManager';

const SettingsContainer = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  
  @media (max-width: 768px) {
    padding: 1.5rem;
  }
  
  @media (max-width: 600px) {
    padding: 1rem;
  }
`;

const TabsContainer = styled.div`
  display: flex;
  border-bottom: 2px solid var(--border-color);
  margin-bottom: 2rem;
  background-color: var(--card-bg);
  border-radius: 8px 8px 0 0;
  overflow: hidden;
  box-shadow: 0 2px 10px var(--shadow-color);
  
  @media (max-width: 768px) {
    flex-wrap: wrap;
  }
  
  @media (max-width: 600px) {
    flex-direction: column;
    gap: 0;
    border-radius: 8px;
  }
`;

const Tab = styled.button`
  padding: 1.2rem 2rem;
  background: ${props => props.active ? 'var(--primary-color)' : 'transparent'};
  border: none;
  color: ${props => props.active ? 'white' : '#666'};
  font-weight: ${props => props.active ? '600' : '500'};
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  flex: 1;
  
  &:hover {
    background: ${props => props.active ? 'var(--primary-hover)' : '#f8f9fa'};
    color: ${props => props.active ? 'white' : 'var(--primary-color)'};
  }
  
  @media (max-width: 768px) {
    padding: 1rem 1.5rem;
    font-size: 0.9rem;
  }
  
  @media (max-width: 600px) {
    padding: 1rem;
    border-bottom: 1px solid #eee;
    flex: none;
    
    &:last-child {
      border-bottom: none;
    }
  }
`;

const TabContent = styled.div`
  display: ${props => props.active ? 'block' : 'none'};
`;

const Card = styled.div`
  background-color: var(--card-bg);
  border-radius: 12px;
  box-shadow: 0 4px 20px var(--shadow-color);
  padding: 2rem;
  margin-bottom: 2rem;
  border: 1px solid var(--border-color);
  
  @media (max-width: 768px) {
    padding: 1.5rem;
    margin-bottom: 1.5rem;
  }
  
  @media (max-width: 600px) {
    padding: 1rem;
    border-radius: 8px;
    margin-bottom: 1rem;
  }
`;

const CardTitle = styled.h3`
  font-size: 1.3rem;
  font-weight: 700;
  margin-bottom: 2rem;
  color: var(--text-color);
  
  @media (max-width: 768px) {
    font-size: 1.2rem;
    margin-bottom: 1.5rem;
  }
  
  @media (max-width: 600px) {
    font-size: 1.1rem;
    margin-bottom: 1rem;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 2rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.8rem;
  font-weight: 600;
  color: var(--text-color);
  font-size: 0.95rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 1rem;
  border: 2px solid var(--input-border);
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  background-color: var(--input-bg);
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
    background-color: white;
    box-shadow: 0 0 0 3px rgba(255, 107, 107, 0.1);
  }
  
  &:hover {
    border-color: #cbd5e0;
  }
  
  @media (max-width: 768px) {
    padding: 0.8rem;
    font-size: 0.9rem;
  }
  
  @media (max-width: 600px) {
    padding: 0.7rem;
    font-size: 0.85rem;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.8rem;
  border: 1px solid var(--input-border);
  border-radius: 4px;
  font-size: 0.9rem;
  min-height: 100px;
  resize: vertical;
  background-color: var(--input-bg);
  color: var(--text-color);
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px rgba(255, 107, 107, 0.1);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.8rem;
  border: 1px solid var(--input-border);
  border-radius: 4px;
  font-size: 0.9rem;
  background-color: var(--input-bg);
  color: var(--text-color);
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

const CheckboxGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Checkbox = styled.input`
  width: 18px;
  height: 18px;
  cursor: pointer;
`;

const ColorPicker = styled.input`
  width: 50px;
  height: 40px;
  padding: 0;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
  
  @media (max-width: 768px) {
    margin-top: 1.5rem;
  }
  
  @media (max-width: 600px) {
    flex-direction: column;
    gap: 0.8rem;
    margin-top: 1rem;
  }
`;

const Button = styled.button`
  padding: 0.8rem 1.5rem;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
`;

const CancelButton = styled(Button)`
  background-color: var(--input-bg);
  color: var(--text-color);
  border: 1px solid var(--input-border);
  
  &:hover {
    background-color: var(--border-color);
  }
`;

const SaveButton = styled(Button)`
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-hover) 100%);
  color: white;
  border: none;
  padding: 1.2rem 3rem;
  border-radius: 10px;
  font-size: 1.1rem;
  font-weight: 700;
  box-shadow: 0 4px 15px var(--shadow-color);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px var(--shadow-color);
    background: linear-gradient(135deg, var(--primary-hover) 0%, var(--primary-color) 100%);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    background: var(--input-bg);
    color: var(--text-color);
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const MessageContainer = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  animation: slideIn 0.3s ease;
  
  &.success {
    background-color: var(--success-color);
    color: white;
    border: 1px solid var(--success-color);
  }
  
  &.error {
    background-color: var(--danger-color);
    color: white;
    border: 1px solid var(--danger-color);
  }
  
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;

const ColorInputContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
`;

const ColorPreview = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 12px;
  border: 3px solid #e1e5e9;
  background-color: ${props => props.color};
  cursor: pointer;
  transition: all 0.3s ease;
  flex-shrink: 0;
  
  &:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const ColorInput = styled.input`
  width: 60px;
  height: 50px;
  padding: 0;
  border: 3px solid #e1e5e9;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  flex-shrink: 0;
  
  &:hover {
    border-color: var(--primary-color);
    transform: scale(1.05);
  }
`;

const ColorTextInput = styled.input`
  width: 120px;
  padding: 0.8rem;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 0.9rem;
  font-family: monospace;
  transition: all 0.3s ease;
  background-color: #fafbfc;
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
    background-color: white;
    box-shadow: 0 0 0 3px rgba(255, 107, 107, 0.1);
  }
  
  &:hover {
    border-color: #cbd5e0;
  }
`;

const SaveContainer = styled.div`
  text-align: center !important;
  margin-top: 3rem !important;
  padding: 2rem !important;
  background: linear-gradient(135deg, var(--card-bg) 0%, var(--input-bg) 100%) !important;
  border-radius: 12px !important;
  border: 1px solid var(--border-color) !important;
`;

const SaveNote = styled.p`
  margin-top: 1rem;
  color: var(--text-color);
  font-size: 0.9rem;
  font-style: italic;
  opacity: 0.7;
`;

const Settings = (props) => {
  const { onMenuClick } = useOutletContext() || {};
  const { settings, loading, error, updateSettings } = useSettings();
  const [activeTab, setActiveTab] = useState('general');
  const [localSettings, setLocalSettings] = useState(settings);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  
  // Update local settings when context settings change
  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);
  
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  const handleInputChange = (tab, field, value) => {
    setLocalSettings(prev => ({
      ...prev,
      [tab]: {
        ...prev[tab],
        [field]: value
      }
    }));
  };
  
  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      setSaveMessage('');
      
      const result = await updateSettings(localSettings);
      
      if (result.success) {
        setSaveMessage('Settings saved successfully!');
        setTimeout(() => setSaveMessage(''), 3000);
      } else {
        setSaveMessage(`Error: ${result.error}`);
      }
    } catch (err) {
      setSaveMessage(`Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = (url) => {
    handleInputChange('appearance', 'logo', url);
  };

  const handleFaviconUpload = (url) => {
    handleInputChange('appearance', 'favicon', url);
  };
  
  if (loading) {
    return (
      <>
        <Header title="Settings" onMenuClick={onMenuClick} />
        <SettingsContainer>
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            Loading settings...
          </div>
        </SettingsContainer>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header title="Settings" onMenuClick={onMenuClick} />
        <SettingsContainer>
          <div style={{ 
            textAlign: 'center', 
            padding: '2rem',
            color: '#721c24',
            backgroundColor: '#f8d7da',
            borderRadius: '4px',
            border: '1px solid #f5c6cb'
          }}>
            Error loading settings: {error}
          </div>
        </SettingsContainer>
      </>
    );
  }

  return (
    <>
      <Header title="Settings" onMenuClick={onMenuClick} />
      {saveMessage && (
        <MessageContainer className={saveMessage.includes('Error') ? 'error' : 'success'}>
          {saveMessage}
        </MessageContainer>
      )}
      <SettingsContainer>
        <TabsContainer>
          <Tab 
            active={activeTab === 'general'} 
            onClick={() => setActiveTab('general')}
          >
            General
          </Tab>
          <Tab 
            active={activeTab === 'appearance'} 
            onClick={() => setActiveTab('appearance')}
          >
            Appearance
          </Tab>
          <Tab 
            active={activeTab === 'hero'} 
            onClick={() => setActiveTab('hero')}
          >
            Hero Slideshow
          </Tab>
          <Tab 
            active={activeTab === 'shipping'} 
            onClick={() => setActiveTab('shipping')}
          >
            Shipping & Taxes
          </Tab>
          <Tab 
            active={activeTab === 'payment'} 
            onClick={() => setActiveTab('payment')}
          >
            Payment Methods
          </Tab>
          <Tab 
            active={activeTab === 'notifications'} 
            onClick={() => setActiveTab('notifications')}
          >
            Notifications
          </Tab>
        </TabsContainer>
        
        {/* General Settings */}
        <TabContent active={activeTab === 'general'}>
          <Card>
            <CardTitle>Store Information</CardTitle>
            <FormGroup>
              <Label htmlFor="storeName">Store Name</Label>
              <Input 
                type="text" 
                id="storeName" 
                value={localSettings.general?.storeName || ''} 
                onChange={(e) => handleInputChange('general', 'storeName', e.target.value)} 
              />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="storeEmail">Store Email</Label>
              <Input 
                type="email" 
                id="storeEmail" 
                value={localSettings.general?.storeEmail || ''} 
                onChange={(e) => handleInputChange('general', 'storeEmail', e.target.value)} 
              />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="storePhone">Store Phone</Label>
              <Input 
                type="tel" 
                id="storePhone" 
                value={localSettings.general?.storePhone || ''} 
                onChange={(e) => handleInputChange('general', 'storePhone', e.target.value)} 
              />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="storeAddress">Store Address</Label>
              <TextArea 
                id="storeAddress" 
                value={localSettings.general?.storeAddress || ''} 
                onChange={(e) => handleInputChange('general', 'storeAddress', e.target.value)} 
              />
            </FormGroup>
          </Card>
          
          <Card>
            <CardTitle>Regional Settings</CardTitle>
            <FormGroup>
              <Label htmlFor="currency">Currency</Label>
              <Select 
                id="currency" 
                value={localSettings.general?.currency || 'USD'} 
                onChange={(e) => handleInputChange('general', 'currency', e.target.value)} 
              >
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
                <option value="CAD">CAD - Canadian Dollar</option>
                <option value="AUD">AUD - Australian Dollar</option>
              </Select>
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="language">Language</Label>
              <Select 
                id="language" 
                value={localSettings.general?.language || 'en'} 
                onChange={(e) => handleInputChange('general', 'language', e.target.value)} 
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="it">Italian</option>
              </Select>
            </FormGroup>
          </Card>
        </TabContent>
        
        {/* Appearance Settings */}
        <TabContent active={activeTab === 'appearance'}>
          <Card>
            <CardTitle>Theme Colors</CardTitle>
                         <FormGroup>
               <Label htmlFor="primaryColor">Primary Color</Label>
               <ColorInputContainer>
                 <ColorPreview 
                   color={localSettings.appearance?.primaryColor || '#ff6b6b'}
                   onClick={() => document.getElementById('primaryColor').click()}
                 />
                 <ColorTextInput 
                   type="text" 
                   value={localSettings.appearance?.primaryColor || '#ff6b6b'} 
                   onChange={(e) => handleInputChange('appearance', 'primaryColor', e.target.value)} 
                   placeholder="#ff6b6b"
                 />
                 <input 
                   type="color" 
                   id="primaryColor" 
                   value={localSettings.appearance?.primaryColor || '#ff6b6b'} 
                   onChange={(e) => handleInputChange('appearance', 'primaryColor', e.target.value)} 
                   style={{ display: 'none' }}
                 />
               </ColorInputContainer>
             </FormGroup>
            
                         <FormGroup>
               <Label htmlFor="secondaryColor">Secondary Color</Label>
               <ColorInputContainer>
                 <ColorPreview 
                   color={localSettings.appearance?.secondaryColor || '#e05050'}
                   onClick={() => document.getElementById('secondaryColor').click()}
                 />
                 <ColorTextInput 
                   type="text" 
                   value={localSettings.appearance?.secondaryColor || '#e05050'} 
                   onChange={(e) => handleInputChange('appearance', 'secondaryColor', e.target.value)} 
                   placeholder="#e05050"
                 />
                 <input 
                   type="color" 
                   id="secondaryColor" 
                   value={localSettings.appearance?.secondaryColor || '#e05050'} 
                   onChange={(e) => handleInputChange('appearance', 'secondaryColor', e.target.value)} 
                   style={{ display: 'none' }}
                 />
               </ColorInputContainer>
             </FormGroup>
          </Card>
          
                     <Card>
             <CardTitle>Store Branding</CardTitle>
             <FormGroup>
               <Label>Logo</Label>
               <LogoUpload 
                 type="logo"
                 currentValue={localSettings.appearance?.logo || '/logo.png'}
                 onUpload={handleLogoUpload}
                 onRemove={() => handleInputChange('appearance', 'logo', '/logo.png')}
               />
             </FormGroup>
             
             <FormGroup>
               <Label>Favicon</Label>
               <LogoUpload 
                 type="favicon"
                 currentValue={localSettings.appearance?.favicon || '/favicon.ico'}
                 onUpload={handleFaviconUpload}
                 onRemove={() => handleInputChange('appearance', 'favicon', '/favicon.ico')}
               />
             </FormGroup>
             
             <FormGroup>
               <Label htmlFor="logoGlowColor">Logo Glow Color</Label>
               <ColorInputContainer>
                 <ColorPreview 
                   color={localSettings.appearance?.logoGlowColor || '#ff6b6b'}
                   onClick={() => document.getElementById('logoGlowColor').click()}
                 />
                 <ColorTextInput 
                   type="text" 
                   value={localSettings.appearance?.logoGlowColor || '#ff6b6b'} 
                   onChange={(e) => handleInputChange('appearance', 'logoGlowColor', e.target.value)} 
                   placeholder="#ff6b6b"
                 />
                 <input 
                   type="color" 
                   id="logoGlowColor" 
                   value={localSettings.appearance?.logoGlowColor || '#ff6b6b'} 
                   onChange={(e) => handleInputChange('appearance', 'logoGlowColor', e.target.value)} 
                   style={{ display: 'none' }}
                 />
               </ColorInputContainer>
             </FormGroup>
           </Card>
          
          <Card>
            <CardTitle>Product Display</CardTitle>
            <FormGroup>
              <CheckboxGroup>
                <Checkbox 
                  type="checkbox" 
                  id="showFeaturedProducts" 
                  checked={localSettings.appearance?.showFeaturedProducts || false} 
                  onChange={(e) => handleInputChange('appearance', 'showFeaturedProducts', e.target.checked)} 
                />
                <Label htmlFor="showFeaturedProducts">Show Featured Products on Homepage</Label>
              </CheckboxGroup>
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="productsPerPage">Products Per Page</Label>
              <Input 
                type="number" 
                id="productsPerPage" 
                min="4" 
                max="48" 
                step="4" 
                value={localSettings.appearance?.productsPerPage || 12} 
                onChange={(e) => handleInputChange('appearance', 'productsPerPage', parseInt(e.target.value))} 
              />
            </FormGroup>
            
            <FormGroup>
              <div style={{ 
                padding: '1rem', 
                backgroundColor: 'var(--input-bg)', 
                borderRadius: '8px', 
                border: '1px solid var(--border-color)',
                color: 'var(--text-color)',
                fontSize: '0.9rem'
              }}>
                <strong>Dark Mode:</strong> Dark mode preference is now stored per user (including guest users) using cookies. 
                Users can toggle dark mode using the button in the navigation bar, and their preference will be remembered across sessions.
              </div>
            </FormGroup>
          </Card>
        </TabContent>
        
        {/* Hero Settings */}
        <TabContent active={activeTab === 'hero'}>
          <Card>
            <CardTitle>Hero Slideshow Settings</CardTitle>
            <FormGroup>
              <CheckboxGroup>
                <Checkbox 
                  type="checkbox" 
                  id="autoPlay" 
                  checked={localSettings.hero?.autoPlay ?? true} 
                  onChange={(e) => handleInputChange('hero', 'autoPlay', e.target.checked)} 
                />
                <Label htmlFor="autoPlay">Auto-play slideshow</Label>
              </CheckboxGroup>
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="autoPlaySpeed">Auto-play Speed (milliseconds)</Label>
              <Input 
                type="number" 
                id="autoPlaySpeed" 
                min="1000" 
                max="10000" 
                step="500" 
                value={localSettings.hero?.autoPlaySpeed ?? 5000} 
                onChange={(e) => handleInputChange('hero', 'autoPlaySpeed', parseInt(e.target.value))} 
              />
            </FormGroup>
            
            <FormGroup>
              <CheckboxGroup>
                <Checkbox 
                  type="checkbox" 
                  id="showDots" 
                  checked={localSettings.hero?.showDots ?? true} 
                  onChange={(e) => handleInputChange('hero', 'showDots', e.target.checked)} 
                />
                <Label htmlFor="showDots">Show navigation dots</Label>
              </CheckboxGroup>
            </FormGroup>
            
            <FormGroup>
              <CheckboxGroup>
                <Checkbox 
                  type="checkbox" 
                  id="showArrows" 
                  checked={localSettings.hero?.showArrows ?? true} 
                  onChange={(e) => handleInputChange('hero', 'showArrows', e.target.checked)} 
                />
                <Label htmlFor="showArrows">Show navigation arrows</Label>
              </CheckboxGroup>
            </FormGroup>
          </Card>
          
          <Card>
            <CardTitle>Manage Hero Slides</CardTitle>
            <HeroSlidesManager 
              onSlidesChange={(slides) => handleInputChange('hero', 'slides', slides)}
            />
          </Card>
        </TabContent>
        
        {/* Shipping Settings */}
        <TabContent active={activeTab === 'shipping'}>
          <Card>
            <CardTitle>Shipping Options</CardTitle>
            <FormGroup>
              <Label htmlFor="freeShippingThreshold">Free Shipping Threshold ($)</Label>
              <Input 
                type="number" 
                id="freeShippingThreshold" 
                min="0" 
                step="0.01" 
                value={settings.shipping.freeShippingThreshold} 
                onChange={(e) => handleInputChange('shipping', 'freeShippingThreshold', parseFloat(e.target.value))} 
              />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="standardShippingRate">Standard Shipping Rate ($)</Label>
              <Input 
                type="number" 
                id="standardShippingRate" 
                min="0" 
                step="0.01" 
                value={settings.shipping.standardShippingRate} 
                onChange={(e) => handleInputChange('shipping', 'standardShippingRate', parseFloat(e.target.value))} 
              />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="expressShippingRate">Express Shipping Rate ($)</Label>
              <Input 
                type="number" 
                id="expressShippingRate" 
                min="0" 
                step="0.01" 
                value={settings.shipping.expressShippingRate} 
                onChange={(e) => handleInputChange('shipping', 'expressShippingRate', parseFloat(e.target.value))} 
              />
            </FormGroup>
          </Card>
          
          <Card>
            <CardTitle>Tax Settings</CardTitle>
            <FormGroup>
              <Label htmlFor="taxRate">Tax Rate (%)</Label>
              <Input 
                type="number" 
                id="taxRate" 
                min="0" 
                max="100" 
                step="0.1" 
                value={settings.shipping.taxRate} 
                onChange={(e) => handleInputChange('shipping', 'taxRate', parseFloat(e.target.value))} 
              />
            </FormGroup>
          </Card>
        </TabContent>
        
        {/* Payment Settings */}
        <TabContent active={activeTab === 'payment'}>
          <Card>
            <CardTitle>Payment Methods</CardTitle>
            <FormGroup>
              <CheckboxGroup>
                <Checkbox 
                  type="checkbox" 
                  id="acceptCreditCards" 
                  checked={settings.payment.acceptCreditCards} 
                  onChange={(e) => handleInputChange('payment', 'acceptCreditCards', e.target.checked)} 
                />
                <Label htmlFor="acceptCreditCards">Accept Credit Cards</Label>
              </CheckboxGroup>
            </FormGroup>
            
            <FormGroup>
              <CheckboxGroup>
                <Checkbox 
                  type="checkbox" 
                  id="acceptPayPal" 
                  checked={settings.payment.acceptPayPal} 
                  onChange={(e) => handleInputChange('payment', 'acceptPayPal', e.target.checked)} 
                />
                <Label htmlFor="acceptPayPal">Accept PayPal</Label>
              </CheckboxGroup>
            </FormGroup>
            
            <FormGroup>
              <CheckboxGroup>
                <Checkbox 
                  type="checkbox" 
                  id="acceptApplePay" 
                  checked={settings.payment.acceptApplePay} 
                  onChange={(e) => handleInputChange('payment', 'acceptApplePay', e.target.checked)} 
                />
                <Label htmlFor="acceptApplePay">Accept Apple Pay</Label>
              </CheckboxGroup>
            </FormGroup>
            
            <FormGroup>
              <CheckboxGroup>
                <Checkbox 
                  type="checkbox" 
                  id="acceptGooglePay" 
                  checked={settings.payment.acceptGooglePay} 
                  onChange={(e) => handleInputChange('payment', 'acceptGooglePay', e.target.checked)} 
                />
                <Label htmlFor="acceptGooglePay">Accept Google Pay</Label>
              </CheckboxGroup>
            </FormGroup>
          </Card>
          
          <Card>
            <CardTitle>Payment Gateway Settings</CardTitle>
            <FormGroup>
              <Label htmlFor="stripePublicKey">Stripe Public Key</Label>
              <Input 
                type="text" 
                id="stripePublicKey" 
                value={settings.payment.stripePublicKey} 
                onChange={(e) => handleInputChange('payment', 'stripePublicKey', e.target.value)} 
              />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="paypalClientId">PayPal Client ID</Label>
              <Input 
                type="text" 
                id="paypalClientId" 
                value={settings.payment.paypalClientId} 
                onChange={(e) => handleInputChange('payment', 'paypalClientId', e.target.value)} 
              />
            </FormGroup>
          </Card>
        </TabContent>
        
        {/* Notifications Settings */}
        <TabContent active={activeTab === 'notifications'}>
          <Card>
            <CardTitle>Email Notifications</CardTitle>
            <FormGroup>
              <CheckboxGroup>
                <Checkbox 
                  type="checkbox" 
                  id="orderConfirmation" 
                  checked={settings.notifications.orderConfirmation} 
                  onChange={(e) => handleInputChange('notifications', 'orderConfirmation', e.target.checked)} 
                />
                <Label htmlFor="orderConfirmation">Order Confirmation</Label>
              </CheckboxGroup>
            </FormGroup>
            
            <FormGroup>
              <CheckboxGroup>
                <Checkbox 
                  type="checkbox" 
                  id="orderShipped" 
                  checked={settings.notifications.orderShipped} 
                  onChange={(e) => handleInputChange('notifications', 'orderShipped', e.target.checked)} 
                />
                <Label htmlFor="orderShipped">Order Shipped</Label>
              </CheckboxGroup>
            </FormGroup>
            
            <FormGroup>
              <CheckboxGroup>
                <Checkbox 
                  type="checkbox" 
                  id="orderDelivered" 
                  checked={settings.notifications.orderDelivered} 
                  onChange={(e) => handleInputChange('notifications', 'orderDelivered', e.target.checked)} 
                />
                <Label htmlFor="orderDelivered">Order Delivered</Label>
              </CheckboxGroup>
            </FormGroup>
            
            <FormGroup>
              <CheckboxGroup>
                <Checkbox 
                  type="checkbox" 
                  id="abandonedCart" 
                  checked={settings.notifications.abandonedCart} 
                  onChange={(e) => handleInputChange('notifications', 'abandonedCart', e.target.checked)} 
                />
                <Label htmlFor="abandonedCart">Abandoned Cart Reminder</Label>
              </CheckboxGroup>
            </FormGroup>
            
            <FormGroup>
              <CheckboxGroup>
                <Checkbox 
                  type="checkbox" 
                  id="emailNewsletter" 
                  checked={settings.notifications.emailNewsletter} 
                  onChange={(e) => handleInputChange('notifications', 'emailNewsletter', e.target.checked)} 
                />
                <Label htmlFor="emailNewsletter">Email Newsletter</Label>
              </CheckboxGroup>
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="emailFormat">Email Format</Label>
              <Select 
                id="emailFormat" 
                value={settings.notifications.emailFormat} 
                onChange={(e) => handleInputChange('notifications', 'emailFormat', e.target.value)} 
              >
                <option value="html">HTML</option>
                <option value="text">Plain Text</option>
              </Select>
            </FormGroup>
          </Card>
        </TabContent>
        

        
                 <SaveContainer>
           <SaveButton onClick={handleSaveSettings} disabled={saving}>
             {saving ? 'Saving...' : 'Save Settings'}
           </SaveButton>
           <SaveNote>
             Changes will be applied immediately after saving
           </SaveNote>
         </SaveContainer>
      </SettingsContainer>
    </>
  );
};

export default Settings;