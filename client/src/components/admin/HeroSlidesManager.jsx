import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useSettings } from '../../context/SettingsContext';

const Container = styled.div`
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
`;

const Title = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: var(--text-color);
`;

const SlideItem = styled.div`
  border: 1px solid var(--border-color);
  border-radius: 12px;
  margin-bottom: 1.5rem;
  background: var(--bg-color);
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
  }
`;

const SlideHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-hover) 100%);
  color: white;
`;

const SlideTitle = styled.h4`
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
`;

const SlideControls = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const Button = styled.button`
  padding: 0.4rem 0.8rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 500;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.5);
  }

  &.danger:hover {
    background: rgba(220, 53, 69, 0.8);
    border-color: rgba(220, 53, 69, 0.8);
  }
`;

const SlideContent = styled.div`
  display: flex;
  gap: 1.5rem;
  padding: 1.5rem;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const ImageSection = styled.div`
  flex-shrink: 0;
  width: 250px;

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const ImagePreview = styled.div`
  width: 100%;
  height: 150px;
  border-radius: 8px;
  overflow: hidden;
  background: var(--input-bg);
  border: 2px solid var(--border-color);
  position: relative;
  margin-bottom: 1rem;
`;

const ImagePlaceholder = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-color);
  opacity: 0.5;
  font-size: 0.9rem;
  text-align: center;
  padding: 1rem;
`;

const SlideImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const ImageUploadSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const UploadButton = styled.label`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    background: var(--primary-hover);
    transform: translateY(-1px);
  }

  input {
    display: none;
  }
`;

const PresetImages = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

const PresetImage = styled.div`
  width: 100%;
  height: 60px;
  border-radius: 6px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid ${props => props.selected ? 'var(--primary-color)' : 'var(--border-color)'};
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--primary-color);
    transform: scale(1.05);
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const FormSection = styled.div`
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1rem;

  &:nth-child(1),
  &:nth-child(2) {
    grid-column: 1 / -1;
  }
`;

const Label = styled.label`
  display: block;
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--text-color);
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 2px solid var(--border-color);
  border-radius: 6px;
  background: var(--input-bg);
  color: var(--text-color);
  font-size: 0.9rem;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(255, 107, 107, 0.1);
  }

  &:hover {
    border-color: var(--primary-color);
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 2px solid var(--border-color);
  border-radius: 6px;
  background: var(--input-bg);
  color: var(--text-color);
  font-size: 0.9rem;
  min-height: 80px;
  resize: vertical;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(255, 107, 107, 0.1);
  }

  &:hover {
    border-color: var(--primary-color);
  }
`;

const AddButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-hover) 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(255, 107, 107, 0.4);
  }

  &:active {
    transform: translateY(0);
  }
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: ${props => props.active ? 'rgba(40, 167, 69, 0.2)' : 'rgba(108, 117, 125, 0.2)'};
  color: ${props => props.active ? '#28a745' : '#6c757d'};
  border: 1px solid ${props => props.active ? 'rgba(40, 167, 69, 0.3)' : 'rgba(108, 117, 125, 0.3)'};
`;

const HeroSlidesManager = ({ onSlidesChange }) => {
  const { settings } = useSettings();
  const [localSlides, setLocalSlides] = useState([]);

  // Preset images for quick selection
  const presetImages = [
    {
      url: "https://images.unsplash.com/photo-1607082350899-7e105aa886ae?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
      name: "Shopping"
    },
    {
      url: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
      name: "Deals"
    },
    {
      url: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
      name: "Shipping"
    },
    {
      url: "https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
      name: "Lifestyle"
    },
    {
      url: "https://images.unsplash.com/photo-1607083206968-13611e3d76db?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
      name: "Technology"
    },
    {
      url: "https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
      name: "Fashion"
    }
  ];

  useEffect(() => {
    if (settings?.hero?.slides) {
      setLocalSlides([...settings.hero.slides]);
    }
  }, [settings?.hero?.slides]);

  const addSlide = () => {
    const newSlide = {
      id: Date.now().toString(),
      title: 'New Slide',
      description: 'Slide description',
      backgroundImage: '',
      buttonText: 'Shop Now',
      buttonLink: '/products',
      secondaryButtonText: '',
      secondaryButtonLink: '',
      active: true
    };
    
    const updatedSlides = [...localSlides, newSlide];
    setLocalSlides(updatedSlides);
    
    // Notify parent component of changes
    if (onSlidesChange) {
      onSlidesChange(updatedSlides);
    }
  };

  const updateSlide = (id, field, value) => {
    const updatedSlides = localSlides.map(slide => 
      slide.id === id ? { ...slide, [field]: value } : slide
    );
    setLocalSlides(updatedSlides);
    
    // Notify parent component of changes
    if (onSlidesChange) {
      onSlidesChange(updatedSlides);
    }
  };

  const removeSlide = (id) => {
    const updatedSlides = localSlides.filter(slide => slide.id !== id);
    setLocalSlides(updatedSlides);
    
    // Notify parent component of changes
    if (onSlidesChange) {
      onSlidesChange(updatedSlides);
    }
  };

  const toggleSlideActive = (id) => {
    const updatedSlides = localSlides.map(slide => 
      slide.id === id ? { ...slide, active: !slide.active } : slide
    );
    setLocalSlides(updatedSlides);
    
    // Notify parent component of changes
    if (onSlidesChange) {
      onSlidesChange(updatedSlides);
    }
  };

  const handleImageUpload = (slideId, event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        updateSlide(slideId, 'backgroundImage', e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const selectPresetImage = (slideId, imageUrl) => {
    updateSlide(slideId, 'backgroundImage', imageUrl);
  };

  return (
    <Container>
      <Title>Hero Slides Management</Title>
      
      {localSlides.map((slide) => (
        <SlideItem key={slide.id}>
          <SlideHeader>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <SlideTitle>Slide: {slide.title}</SlideTitle>
              <StatusBadge active={slide.active}>
                {slide.active ? 'Active' : 'Inactive'}
              </StatusBadge>
            </div>
            <SlideControls>
              <Button onClick={() => toggleSlideActive(slide.id)}>
                {slide.active ? 'Deactivate' : 'Activate'}
              </Button>
              <Button 
                className="danger" 
                onClick={() => removeSlide(slide.id)}
              >
                Remove
              </Button>
            </SlideControls>
          </SlideHeader>
          
          <SlideContent>
            <ImageSection>
              <ImagePreview>
                {slide.backgroundImage ? (
                  <SlideImage 
                    src={slide.backgroundImage} 
                    alt="Slide background"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <ImagePlaceholder style={{ display: slide.backgroundImage ? 'none' : 'flex' }}>
                  No image set
                </ImagePlaceholder>
              </ImagePreview>
              
              <ImageUploadSection>
                <UploadButton>
                  📁 Upload Image
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(slide.id, e)}
                  />
                </UploadButton>
                
                <Label>Or choose a preset:</Label>
                <PresetImages>
                  {presetImages.map((preset, index) => (
                    <PresetImage
                      key={index}
                      selected={slide.backgroundImage === preset.url}
                      onClick={() => selectPresetImage(slide.id, preset.url)}
                      title={preset.name}
                    >
                      <img src={preset.url} alt={preset.name} />
                    </PresetImage>
                  ))}
                </PresetImages>
              </ImageUploadSection>
            </ImageSection>
            
            <FormSection>
              <FormGroup>
                <Label>Title:</Label>
                <Input
                  type="text"
                  value={slide.title}
                  onChange={(e) => updateSlide(slide.id, 'title', e.target.value)}
                  placeholder="Enter slide title..."
                />
              </FormGroup>
              
              <FormGroup>
                <Label>Description:</Label>
                <Textarea
                  value={slide.description}
                  onChange={(e) => updateSlide(slide.id, 'description', e.target.value)}
                  placeholder="Enter slide description..."
                />
              </FormGroup>
              
              <FormGroup>
                <Label>Background Image URL:</Label>
                <Input
                  type="url"
                  value={slide.backgroundImage}
                  onChange={(e) => updateSlide(slide.id, 'backgroundImage', e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
              </FormGroup>
              
              <FormGroup>
                <Label>Primary Button Text:</Label>
                <Input
                  type="text"
                  value={slide.buttonText}
                  onChange={(e) => updateSlide(slide.id, 'buttonText', e.target.value)}
                  placeholder="Shop Now"
                />
              </FormGroup>
              
              <FormGroup>
                <Label>Primary Button Link:</Label>
                <Input
                  type="text"
                  value={slide.buttonLink}
                  onChange={(e) => updateSlide(slide.id, 'buttonLink', e.target.value)}
                  placeholder="/products"
                />
              </FormGroup>
              
              <FormGroup>
                <Label>Secondary Button Text:</Label>
                <Input
                  type="text"
                  value={slide.secondaryButtonText}
                  onChange={(e) => updateSlide(slide.id, 'secondaryButtonText', e.target.value)}
                  placeholder="Learn More (optional)"
                />
              </FormGroup>
              
              <FormGroup>
                <Label>Secondary Button Link:</Label>
                <Input
                  type="text"
                  value={slide.secondaryButtonLink}
                  onChange={(e) => updateSlide(slide.id, 'secondaryButtonLink', e.target.value)}
                  placeholder="/about"
                />
              </FormGroup>
            </FormSection>
          </SlideContent>
        </SlideItem>
      ))}
      
      <AddButton onClick={addSlide}>
        + Add New Slide
      </AddButton>
    </Container>
  );
};

export default HeroSlidesManager;
