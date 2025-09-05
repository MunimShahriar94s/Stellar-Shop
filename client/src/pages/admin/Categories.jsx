import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/admin/Header';
import { useOutletContext } from 'react-router-dom';
import { getAdminCategories, createCategory, updateCategory, deleteCategory, toggleCategoryStatus } from '../../services/categoriesService';
import LogoUpload from '../../components/admin/LogoUpload';
import viewIcon from '../../assets/view-icon.svg';
import editIcon from '../../assets/edit-icon.svg';
import deleteIcon from '../../assets/delete-icon.svg';
import toggleIcon from '../../assets/toggle-icon.svg';

const CategoriesContainer = styled.div`
  padding: 1.5rem;
  @media (max-width: 600px) {
    padding: 0.5rem;
  }
`;

const SectionTitle = styled.h2`
  font-size: 1.2rem;
  font-weight: 600;
  margin: 2rem 0 1rem;
  color: var(--text-color);
  
  &:first-child {
    margin-top: 0;
  }
`;

const ActionBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
`;

const AddButton = styled.button`
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-hover) 100%);
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
  }
  
  svg {
    width: 20px;
    height: 20px;
  }
`;

const AddCategoryText = styled.span`
  @media (max-width: 600px) {
    display: none;
  }
`;

const SearchInput = styled.input`
  padding: 0.8rem 1rem;
  border: 1px solid var(--input-border);
  border-radius: 8px;
  font-size: 0.9rem;
  background-color: var(--input-bg);
  color: var(--text-color);
  width: 300px;
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px rgba(255, 107, 107, 0.1);
  }
  
  &::placeholder {
    color: var(--text-color);
    opacity: 0.5;
  }
  
  @media (max-width: 600px) {
    width: 100%;
  }
`;

const CategoriesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
`;

const CategoryCard = styled.div`
  background-color: var(--card-bg);
  border-radius: 12px;
  box-shadow: 0 4px 20px var(--shadow-color);
  border: 1px solid var(--border-color);
  overflow: hidden;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 30px var(--shadow-color);
  }
`;

const CategoryImage = styled.div`
  height: 200px;
  background-color: var(--input-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .placeholder {
    color: var(--text-color);
    opacity: 0.5;
    font-size: 3rem;
  }
`;

const CategoryContent = styled.div`
  padding: 1.5rem;
`;

const CategoryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const CategoryInfo = styled.div`
  flex: 1;
`;

const CategoryName = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 0.5rem;
`;

const CategoryDescription = styled.p`
  color: var(--text-color);
  opacity: 0.7;
  font-size: 0.9rem;
  margin-bottom: 1rem;
  line-height: 1.4;
`;

const CategoryStats = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const Stat = styled.div`
  text-align: center;
  
  .number {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--primary-color);
  }
  
  .label {
    font-size: 0.8rem;
    color: var(--text-color);
    opacity: 0.7;
  }
`;

const CategoryActions = styled.div`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  display: flex;
  gap: 0.5rem;
  opacity: 0;
  transform: translateY(-10px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  ${CategoryImage}:hover & {
    opacity: 1;
    transform: translateY(0);
  }
`;

const ActionButton = styled.button`
  background-color: rgba(255, 255, 255, 0.95);
  color: #333;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
  
  &:hover {
    background-color: ${props => {
      if (props.delete) return '#f44336';
      if (props.toggle) return props.active ? '#ff9800' : '#4caf50';
      if (props.view) return '#2196f3';
      return 'var(--primary-color)';
    }};
    color: white;
    transform: scale(1.1);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  }
  
  &:active {
    transform: scale(0.95);
  }
  
  img {
    width: 18px;
    height: 18px;
    transition: all 0.3s ease;
    filter: brightness(0);
  }
  
  &:hover img {
    filter: brightness(0) invert(1);
  }
  
  @media (max-width: 600px) {
    width: 44px;
    height: 44px;
    img {
      width: 24px;
      height: 24px;
    }
  }
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
  background-color: ${props => props.active ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255, 152, 0, 0.1)'};
  color: ${props => props.active ? 'var(--success-color)' : 'var(--warning-color)'};
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: ${props => props.isOpen ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: var(--card-bg);
  border-radius: 12px;
  box-shadow: 0 10px 30px var(--shadow-color);
  border: 1px solid var(--border-color);
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  margin: 1rem;
`;

const ModalHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ModalTitle = styled.h2`
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--text-color);
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-color);
  opacity: 0.7;
  
  svg {
    width: 24px;
    height: 24px;
  }
  
  &:hover {
    opacity: 1;
  }
`;

const ModalBody = styled.div`
  padding: 1.5rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: var(--text-color);
  font-size: 0.9rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.8rem;
  border: 2px solid var(--input-border);
  border-radius: 8px;
  font-size: 0.9rem;
  background-color: var(--input-bg);
  color: var(--text-color);
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px rgba(255, 107, 107, 0.1);
  }
  
  &::placeholder {
    color: var(--text-color);
    opacity: 0.5;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.8rem;
  border: 2px solid var(--input-border);
  border-radius: 8px;
  font-size: 0.9rem;
  background-color: var(--input-bg);
  color: var(--text-color);
  min-height: 100px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px rgba(255, 107, 107, 0.1);
  }
  
  &::placeholder {
    color: var(--text-color);
    opacity: 0.5;
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

const ModalFooter = styled.div`
  padding: 1.5rem;
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
`;

const Button = styled.button`
  padding: 0.8rem 1.5rem;
  border-radius: 8px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  
  &.cancel {
    background-color: var(--input-bg);
    color: var(--text-color);
    border: 1px solid var(--input-border);
    
    &:hover {
      background-color: var(--border-color);
    }
  }
  
  &.save {
    background-color: var(--primary-color);
    color: white;
    
    &:hover {
      background-color: var(--primary-hover);
    }
    
    &:disabled {
      background-color: var(--text-color);
      opacity: 0.6;
      cursor: not-allowed;
    }
  }
`;

const LoadingSpinner = styled.div`
  text-align: center;
  padding: 2rem;
  color: var(--text-color);
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: 2rem;
  color: var(--danger-color);
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: var(--text-color);
  opacity: 0.7;
  
  h3 {
    margin-bottom: 1rem;
  }
  
  p {
    margin-bottom: 2rem;
  }
`;

const ConfirmationModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: ${props => props.isOpen ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  z-index: 1001;
`;

const ConfirmationContent = styled.div`
  background-color: var(--card-bg);
  border-radius: 12px;
  box-shadow: 0 10px 30px var(--shadow-color);
  border: 1px solid var(--border-color);
  width: 100%;
  max-width: 400px;
  margin: 1rem;
`;

const ConfirmationHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const ConfirmationIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${props => props.type === 'warning' ? 'rgba(255, 152, 0, 0.1)' : 'rgba(220, 53, 69, 0.1)'};
  color: ${props => props.type === 'warning' ? 'var(--warning-color)' : 'var(--danger-color)'};
  
  svg {
    width: 24px;
    height: 24px;
  }
`;

const ConfirmationTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--text-color);
  margin: 0;
`;

const ConfirmationBody = styled.div`
  padding: 1.5rem;
`;

const ConfirmationMessage = styled.p`
  color: var(--text-color);
  line-height: 1.5;
  margin: 0;
`;

const ConfirmationFooter = styled.div`
  padding: 1.5rem;
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
`;

const ConfirmationButton = styled.button`
  padding: 0.8rem 1.5rem;
  border-radius: 8px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  
  &.cancel {
    background-color: var(--input-bg);
    color: var(--text-color);
    border: 1px solid var(--input-border);
    
    &:hover {
      background-color: var(--border-color);
    }
  }
  
  &.confirm {
    background-color: var(--danger-color);
    color: white;
    
    &:hover {
      background-color: #c82333;
    }
  }
  
  &.okay {
    background-color: var(--primary-color);
    color: white;
    
    &:hover {
      background-color: var(--primary-hover);
    }
  }
`;

const Categories = () => {
  const { onMenuClick } = useOutletContext() || {};
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_active: true,
    image: null
  });
  
  // Confirmation modal states
  const [hoveredButton, setHoveredButton] = useState(null);
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    type: 'delete', // 'delete' or 'warning'
    title: '',
    message: '',
    onConfirm: null
  });

  // Fetch categories
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await getAdminCategories();
      setCategories(data);
      setFilteredCategories(data);
      setError('');
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Filter categories based on search term
  useEffect(() => {
    if (searchTerm) {
      const filtered = categories.filter(category =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCategories(filtered);
    } else {
      setFilteredCategories(categories);
    }
  }, [searchTerm, categories]);

  const handleAddCategory = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      description: '',
      is_active: true,
      image: null
    });
    setIsModalOpen(true);
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      is_active: category.is_active,
      image: null
    });
    setIsModalOpen(true);
  };

  const handleDeleteCategory = async (category) => {
    if (category.product_count > 0) {
      // Show warning popup for categories with products
      setConfirmationModal({
        isOpen: true,
        type: 'warning',
        title: 'Cannot Delete Category',
        message: `This category has ${category.product_count} product(s). Please delete or reassign the products first before deleting this category.`,
        onConfirm: () => setConfirmationModal({ isOpen: false, type: 'delete', title: '', message: '', onConfirm: null })
      });
      return;
    }

    // Show confirmation popup for deletion
    setConfirmationModal({
      isOpen: true,
      type: 'delete',
      title: 'Delete Category',
      message: `Are you sure you want to delete "${category.name}"? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          await deleteCategory(category.id);
          await fetchCategories();
          setConfirmationModal({ isOpen: false, type: 'delete', title: '', message: '', onConfirm: null });
        } catch (err) {
          // Show error popup
          setConfirmationModal({
            isOpen: true,
            type: 'warning',
            title: 'Error',
            message: err.message || 'Failed to delete category. Please try again.',
            onConfirm: () => setConfirmationModal({ isOpen: false, type: 'delete', title: '', message: '', onConfirm: null })
          });
        }
      }
    });
  };

  const handleToggleStatus = async (id) => {
    try {
      await toggleCategoryStatus(id);
      await fetchCategories();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, formData);
      } else {
        await createCategory(formData);
      }
      
      setIsModalOpen(false);
      await fetchCategories();
    } catch (err) {
      // Show error popup
      setConfirmationModal({
        isOpen: true,
        type: 'warning',
        title: 'Error',
        message: err.message || 'Failed to save category. Please try again.',
        onConfirm: () => setConfirmationModal({ isOpen: false, type: 'delete', title: '', message: '', onConfirm: null })
      });
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = (url) => {
    // For now, we'll handle image upload separately
    // You might want to implement a proper image upload system
    console.log('Image uploaded:', url);
  };

  const handleViewProducts = (categoryId, categoryName) => {
    // Navigate to products page with category filter
    navigate(`/admin/products?category=${categoryId}&categoryName=${encodeURIComponent(categoryName)}`);
  };

  if (loading) {
    return (
      <>
        <Header title="Categories" onMenuClick={onMenuClick} />
        <CategoriesContainer>
          <LoadingSpinner>Loading categories...</LoadingSpinner>
        </CategoriesContainer>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header title="Categories" onMenuClick={onMenuClick} />
        <CategoriesContainer>
          <ErrorMessage>
            <h3>Error</h3>
            <p>{error}</p>
            <Button onClick={fetchCategories}>Retry</Button>
          </ErrorMessage>
        </CategoriesContainer>
      </>
    );
  }

  return (
    <>
      <Header title="Categories" onMenuClick={onMenuClick} />
      <CategoriesContainer>
        <ActionBar>
          <SearchInput
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <AddButton onClick={handleAddCategory}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 5V19" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M5 12H19" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <AddCategoryText>Add Category</AddCategoryText>
          </AddButton>
        </ActionBar>

        {filteredCategories.length === 0 ? (
          <EmptyState>
            <h3>No categories found</h3>
            <p>Create your first category to get started.</p>
            <AddButton onClick={handleAddCategory}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 5V19" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M5 12H19" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Add Category
            </AddButton>
          </EmptyState>
        ) : (
          <CategoriesGrid>
            {filteredCategories.map(category => (
              <CategoryCard key={category.id}>
                <CategoryImage>
                  {category.image ? (
                    <img src={category.image} alt={category.name} />
                  ) : (
                    <div className="placeholder">📁</div>
                  )}
                  <CategoryActions>
                    <ActionButton 
                      view
                      onClick={() => handleViewProducts(category.id, category.name)}
                      title="View Products"
                    >
                      <img src={viewIcon} alt="View Products" />
                    </ActionButton>
                    <ActionButton 
                      toggle
                      active={category.is_active}
                      onClick={() => handleToggleStatus(category.id)}
                      title={category.is_active ? 'Deactivate' : 'Activate'}
                    >
                      <img src={toggleIcon} alt="Toggle Status" />
                    </ActionButton>
                    <ActionButton 
                      onClick={() => handleEditCategory(category)}
                      title="Edit Category"
                    >
                      <img src={editIcon} alt="Edit Category" />
                    </ActionButton>
                    <ActionButton 
                      delete
                      onClick={() => handleDeleteCategory(category)}
                      title="Delete Category"
                    >
                      <img src={deleteIcon} alt="Delete Category" />
                    </ActionButton>
                  </CategoryActions>
                </CategoryImage>
                <CategoryContent>
                  <CategoryHeader>
                    <CategoryInfo>
                      <CategoryName>{category.name}</CategoryName>
                      <StatusBadge active={category.is_active}>
                        {category.is_active ? 'Active' : 'Inactive'}
                      </StatusBadge>
                    </CategoryInfo>
                  </CategoryHeader>
                  
                  <CategoryDescription>
                    {category.description || 'No description provided'}
                  </CategoryDescription>
                  
                  <CategoryStats>
                    <Stat>
                      <div className="number">{category.product_count || 0}</div>
                      <div className="label">Products</div>
                    </Stat>
                  </CategoryStats>
                </CategoryContent>
              </CategoryCard>
            ))}
          </CategoriesGrid>
        )}
      </CategoriesContainer>

      {/* Add/Edit Category Modal */}
      <Modal isOpen={isModalOpen} onClick={() => setIsModalOpen(false)}>
        <ModalContent onClick={(e) => e.stopPropagation()}>
          <ModalHeader>
            <ModalTitle>
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </ModalTitle>
            <CloseButton onClick={() => setIsModalOpen(false)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </CloseButton>
          </ModalHeader>
          
          <form onSubmit={handleSubmit}>
            <ModalBody>
              <FormGroup>
                <Label htmlFor="name">Category Name *</Label>
                <Input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter category name"
                  required
                />
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="description">Description</Label>
                <TextArea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Enter category description"
                />
              </FormGroup>
              
              <FormGroup>
                <Label>Category Image</Label>
                <LogoUpload
                  type="category"
                  currentValue={editingCategory?.image || ''}
                  onUpload={handleImageUpload}
                  onRemove={() => handleInputChange('image', null)}
                />
              </FormGroup>
              
              <FormGroup>
                <CheckboxGroup>
                  <Checkbox
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => handleInputChange('is_active', e.target.checked)}
                  />
                  <Label htmlFor="is_active">Active</Label>
                </CheckboxGroup>
              </FormGroup>
            </ModalBody>
            
            <ModalFooter>
              <Button type="button" className="cancel" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="save">
                {editingCategory ? 'Update Category' : 'Create Category'}
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      {/* Confirmation Modal */}
      <ConfirmationModal isOpen={confirmationModal.isOpen}>
        <ConfirmationContent>
          <ConfirmationHeader>
            <ConfirmationIcon type={confirmationModal.type}>
              {confirmationModal.type === 'warning' ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="12" y1="9" x2="12" y2="13" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="12" y1="17" x2="12.01" y2="17" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="10" y1="11" x2="10" y2="17" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="14" y1="11" x2="14" y2="17" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </ConfirmationIcon>
            <ConfirmationTitle>{confirmationModal.title}</ConfirmationTitle>
          </ConfirmationHeader>
          
          <ConfirmationBody>
            <ConfirmationMessage>{confirmationModal.message}</ConfirmationMessage>
          </ConfirmationBody>
          
          <ConfirmationFooter>
            {confirmationModal.type === 'delete' ? (
              <>
                <ConfirmationButton 
                  className="cancel" 
                  onClick={() => setConfirmationModal({ isOpen: false, type: 'delete', title: '', message: '', onConfirm: null })}
                >
                  Cancel
                </ConfirmationButton>
                <ConfirmationButton 
                  className="confirm" 
                  onClick={confirmationModal.onConfirm}
                >
                  Delete
                </ConfirmationButton>
              </>
            ) : (
              <ConfirmationButton 
                className="okay" 
                onClick={confirmationModal.onConfirm}
              >
                Okay
              </ConfirmationButton>
            )}
          </ConfirmationFooter>
        </ConfirmationContent>
      </ConfirmationModal>
    </>
  );
};

export default Categories;
