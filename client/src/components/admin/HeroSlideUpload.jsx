import { useState, useEffect } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  width: 100%;
`;

const SlidesList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const SlideCard = styled.div`
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 10px var(--shadow-color);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 20px var(--shadow-color);
  }
`;

const SlideImage = styled.div`
  width: 100%;
  height: 200px;
  background-image: ${props => `url(${props.src})`};
  background-size: cover;
  background-position: center;
  position: relative;
`;

const SlideOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  
  ${SlideCard}:hover & {
    opacity: 1;
  }
`;

const SlideActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionButton = styled.button`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.3s ease;
  
  &.edit {
    background: var(--primary-color);
    color: white;
    
    &:hover {
      background: var(--primary-hover);
    }
  }
  
  &.delete {
    background: #dc3545;
    color: white;
    
    &:hover {
      background: #c82333;
    }
  }
`;

const SlideInfo = styled.div`
  padding: 1rem;
`;

const SlideTitle = styled.h4`
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-color);
`;

const SlideDescription = styled.p`
  margin: 0 0 0.5rem 0;
  font-size: 0.9rem;
  color: var(--text-color);
  opacity: 0.7;
  line-height: 1.4;
`;

const SlideMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
  color: var(--text-color);
  opacity: 0.6;
`;

const AddSlideButton = styled.button`
  width: 100%;
  padding: 2rem;
  border: 2px dashed var(--border-color);
  border-radius: 12px;
  background: transparent;
  color: var(--text-color);
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: var(--primary-color);
    color: var(--primary-color);
    background: rgba(255, 107, 107, 0.05);
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: var(--card-bg);
  border-radius: 12px;
  padding: 2rem;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalTitle = styled.h3`
  margin: 0 0 1.5rem 0;
  font-size: 1.5rem;
  color: var(--text-color);
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--text-color);
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--input-bg);
  color: var(--text-color);
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px rgba(255, 107, 107, 0.2);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--input-bg);
  color: var(--text-color);
  font-size: 1rem;
  min-height: 100px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px rgba(255, 107, 107, 0.2);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--input-bg);
  color: var(--text-color);
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px rgba(255, 107, 107, 0.2);
  }
`;

const FileInput = styled.div`
  position: relative;
  width: 100%;
  height: 200px;
  border: 2px dashed var(--border-color);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: var(--primary-color);
    background: rgba(255, 107, 107, 0.05);
  }
  
  input[type="file"] {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    cursor: pointer;
  }
`;

const FileInputText = styled.div`
  text-align: center;
  color: var(--text-color);
  
  .icon {
    font-size: 2rem;
    margin-bottom: 0.5rem;
    opacity: 0.5;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &.primary {
    background: var(--primary-color);
    color: white;
    
    &:hover {
      background: var(--primary-hover);
    }
    
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
  
  &.secondary {
    background: transparent;
    color: var(--text-color);
    border: 1px solid var(--border-color);
    
    &:hover {
      background: var(--input-bg);
    }
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
`;

const HeroSlideUpload = () => {
  const [slides, setSlides] = useState([]);
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingSlide, setEditingSlide] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    product_id: '',
    sort_order: 0,
    is_active: true,
    image: null
  });

  // Fetch slides and products
  useEffect(() => {
    fetchSlides();
    fetchProducts();
  }, []);

  const fetchSlides = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/hero-slides/admin', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setSlides(data);
      }
    } catch (error) {
      console.error('Error fetching slides:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleAddSlide = () => {
    setEditingSlide(null);
    setFormData({
      title: '',
      description: '',
      product_id: '',
      sort_order: 0,
      is_active: true,
      image: null
    });
    setShowModal(true);
  };

  const handleEditSlide = (slide) => {
    setEditingSlide(slide);
    setFormData({
      title: slide.title || '',
      description: slide.description || '',
      product_id: slide.product_id || '',
      sort_order: slide.sort_order || 0,
      is_active: slide.is_active !== false,
      image: null
    });
    setShowModal(true);
  };

  const handleDeleteSlide = async (slideId) => {
    if (!confirm('Are you sure you want to delete this slide?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/hero-slides/${slideId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchSlides();
      } else {
        alert('Failed to delete slide');
      }
    } catch (error) {
      console.error('Error deleting slide:', error);
      alert('Error deleting slide');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const formDataToSend = new FormData();
      
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('product_id', formData.product_id);
      formDataToSend.append('sort_order', formData.sort_order);
      formDataToSend.append('is_active', formData.is_active);
      
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      const url = editingSlide 
        ? `/api/hero-slides/${editingSlide.id}`
        : '/api/hero-slides';
      
      const method = editingSlide ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      if (response.ok) {
        setShowModal(false);
        fetchSlides();
      } else {
        const error = await response.json();
        alert(`Failed to save slide: ${error.error}`);
      }
    } catch (error) {
      console.error('Error saving slide:', error);
      alert('Error saving slide');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        image: file
      }));
    }
  };

  return (
    <Container>
      <SlidesList>
        {slides.map((slide) => (
          <SlideCard key={slide.id}>
            <SlideImage src={slide.image}>
              <SlideOverlay>
                <SlideActions>
                  <ActionButton 
                    className="edit"
                    onClick={() => handleEditSlide(slide)}
                  >
                    Edit
                  </ActionButton>
                  <ActionButton 
                    className="delete"
                    onClick={() => handleDeleteSlide(slide.id)}
                  >
                    Delete
                  </ActionButton>
                </SlideActions>
              </SlideOverlay>
            </SlideImage>
            <SlideInfo>
              <SlideTitle>{slide.title}</SlideTitle>
              {slide.description && (
                <SlideDescription>{slide.description}</SlideDescription>
              )}
              <SlideMeta>
                <span>Order: {slide.sort_order}</span>
                <span>{slide.is_active ? 'Active' : 'Inactive'}</span>
              </SlideMeta>
            </SlideInfo>
          </SlideCard>
        ))}
        
        <AddSlideButton onClick={handleAddSlide}>
          + Add New Slide
        </AddSlideButton>
      </SlidesList>

      {showModal && (
        <Modal onClick={() => setShowModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalTitle>
              {editingSlide ? 'Edit Slide' : 'Add New Slide'}
            </ModalTitle>
            
            <form onSubmit={handleSubmit}>
              <FormGroup>
                <Label>Slide Image *</Label>
                <FileInput>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    required={!editingSlide}
                  />
                  <FileInputText>
                    <div className="icon">📷</div>
                    <div>Click to upload image</div>
                    <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>
                      {editingSlide ? 'Leave empty to keep current image' : 'Required'}
                    </div>
                  </FileInputText>
                </FileInput>
              </FormGroup>

              <FormGroup>
                <Label>Slide Title</Label>
                <Input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter slide title"
                />
              </FormGroup>

              <FormGroup>
                <Label>Slide Description</Label>
                <TextArea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Enter slide description"
                />
              </FormGroup>

              <FormGroup>
                <Label>Link to Product (Optional)</Label>
                <Select
                  value={formData.product_id}
                  onChange={(e) => handleInputChange('product_id', e.target.value)}
                >
                  <option value="">No product link</option>
                  {products.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.title} - ${product.price}
                    </option>
                  ))}
                </Select>
              </FormGroup>

              <FormGroup>
                <Label>Sort Order</Label>
                <Input
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => handleInputChange('sort_order', parseInt(e.target.value))}
                  min="0"
                />
              </FormGroup>

              <FormGroup>
                <CheckboxGroup>
                  <Checkbox
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => handleInputChange('is_active', e.target.checked)}
                  />
                  <Label>Active</Label>
                </CheckboxGroup>
              </FormGroup>

              <ButtonGroup>
                <Button
                  type="button"
                  className="secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="primary"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : (editingSlide ? 'Update Slide' : 'Add Slide')}
                </Button>
              </ButtonGroup>
            </form>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

export default HeroSlideUpload;
