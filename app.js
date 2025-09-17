// Marksheet Generator Application
class MarksheetGenerator {
    constructor() {
        this.gradingScale = {
            "A+": { min: 90, max: 100, points: 10 },
            "A": { min: 80, max: 89, points: 9 },
            "B+": { min: 70, max: 79, points: 8 },
            "B": { min: 60, max: 69, points: 7 },
            "C+": { min: 50, max: 59, points: 6 },
            "C": { min: 40, max: 49, points: 5 },
            "D": { min: 33, max: 39, points: 4 },
            "F": { min: 0, max: 32, points: 0 }
        };
        
        this.defaultSubjects = [
            "English", "Mathematics", "Science", "Social Studies", "Hindi", "Computer Science"
        ];
        
        this.passingMarks = 33;
        this.maxMarksPerSubject = 100;
        this.subjectCounter = 0;
        
        this.initializeApp();
    }
    
    initializeApp() {
        this.setupEventListeners();
        this.addDefaultSubjects();
        this.setCurrentDate();
        this.updatePreview();
    }
    
    setupEventListeners() {
        // Photo upload functionality - must be set up early
        this.setupPhotoUpload();
        
        // Signature upload functionality
        this.setupSignatureUpload();
        
        // Form input listeners for all existing fields
        this.setupFormListeners();
        
        // Button event listeners
        document.getElementById('addSubjectBtn').addEventListener('click', (e) => {
            e.preventDefault();
            this.addSubject();
        });
        
        document.getElementById('clearFormBtn').addEventListener('click', (e) => {
            e.preventDefault();
            this.clearForm();
        });
        
        document.getElementById('printMarksheetBtn').addEventListener('click', (e) => {
            e.preventDefault();
            this.printMarksheet();
        });
    }
    
    setupFormListeners() {
        // Listen to all form inputs for real-time updates
        const formInputs = document.querySelectorAll('#marksheetForm input, #marksheetForm textarea, #marksheetForm select');
        formInputs.forEach(input => {
            input.addEventListener('input', () => this.updatePreview());
            input.addEventListener('change', () => this.updatePreview());
        });
    }
    
    setupPhotoUpload() {
        const photoUploadArea = document.getElementById('photoUploadArea');
        const photoInput = document.getElementById('studentPhoto');
        
        if (photoUploadArea && photoInput) {
            // Remove any existing listeners
            photoUploadArea.replaceWith(photoUploadArea.cloneNode(true));
            const newPhotoUploadArea = document.getElementById('photoUploadArea');
            
            // Click to upload
            newPhotoUploadArea.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                photoInput.click();
            });
            
            // Drag and drop
            newPhotoUploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.stopPropagation();
                newPhotoUploadArea.style.borderColor = 'var(--color-primary)';
                newPhotoUploadArea.style.backgroundColor = 'var(--color-bg-1)';
            });
            
            newPhotoUploadArea.addEventListener('dragleave', (e) => {
                e.preventDefault();
                e.stopPropagation();
                newPhotoUploadArea.style.borderColor = '';
                newPhotoUploadArea.style.backgroundColor = '';
            });
            
            newPhotoUploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                e.stopPropagation();
                newPhotoUploadArea.style.borderColor = '';
                newPhotoUploadArea.style.backgroundColor = '';
                
                const files = e.dataTransfer.files;
                if (files.length > 0) {
                    this.processPhotoFile(files[0]);
                }
            });
            
            // File input change
            photoInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    this.processPhotoFile(file);
                }
            });
        }
    }
    
    setupSignatureUpload() {
        const signatureUploadArea = document.getElementById('signatureUploadArea');
        const signatureInput = document.getElementById('principalSignature');
        
        if (signatureUploadArea && signatureInput) {
            // Remove any existing listeners
            signatureUploadArea.replaceWith(signatureUploadArea.cloneNode(true));
            const newSignatureUploadArea = document.getElementById('signatureUploadArea');
            
            // Click to upload
            newSignatureUploadArea.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                signatureInput.click();
            });
            
            // File input change
            signatureInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    this.processSignatureFile(file);
                }
            });
        }
    }
    
    addDefaultSubjects() {
        this.defaultSubjects.forEach(subject => {
            this.addSubject(subject);
        });
    }
    
    setCurrentDate() {
        const today = new Date();
        const dateString = today.toISOString().split('T')[0];
        document.getElementById('issueDate').value = dateString;
    }
    
    addSubject(subjectName = '') {
        const container = document.getElementById('subjectsContainer');
        const subjectId = `subject_${this.subjectCounter++}`;
        
        const subjectDiv = document.createElement('div');
        subjectDiv.className = 'subject-entry';
        subjectDiv.setAttribute('data-subject-id', subjectId);
        
        subjectDiv.innerHTML = `
            <div class="subject-header">
                <h4>Subject ${this.subjectCounter}</h4>
                <button type="button" class="remove-subject-btn" data-subject-id="${subjectId}">
                    Remove
                </button>
            </div>
            <div class="subject-fields">
                <div class="form-group">
                    <label class="form-label">Subject Name</label>
                    <input type="text" class="form-control subject-name" value="${subjectName}" placeholder="Enter subject name">
                </div>
                <div class="form-group">
                    <label class="form-label">Theory Marks</label>
                    <input type="number" class="form-control theory-marks" min="0" max="100" placeholder="0" value="0">
                </div>
                <div class="form-group">
                    <label class="form-label">Practical Marks</label>
                    <input type="number" class="form-control practical-marks" min="0" max="100" placeholder="0" value="0">
                </div>
                <div class="form-group">
                    <label class="form-label">Total</label>
                    <div class="calculated-field total-marks">0</div>
                </div>
                <div class="form-group">
                    <label class="form-label">Grade</label>
                    <div class="calculated-field subject-grade">F</div>
                </div>
            </div>
        `;
        
        container.appendChild(subjectDiv);
        
        // Add event listener for remove button
        const removeBtn = subjectDiv.querySelector('.remove-subject-btn');
        removeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.removeSubject(subjectId);
        });
        
        // Add event listeners to input fields
        const subjectNameInput = subjectDiv.querySelector('.subject-name');
        const theoryInput = subjectDiv.querySelector('.theory-marks');
        const practicalInput = subjectDiv.querySelector('.practical-marks');
        
        [subjectNameInput, theoryInput, practicalInput].forEach(input => {
            input.addEventListener('input', () => {
                this.calculateSubjectTotal(subjectId);
                this.updatePreview();
            });
            input.addEventListener('change', () => {
                this.calculateSubjectTotal(subjectId);
                this.updatePreview();
            });
        });
        
        // Initial calculation
        this.calculateSubjectTotal(subjectId);
    }
    
    removeSubject(subjectId) {
        const subjectElement = document.querySelector(`[data-subject-id="${subjectId}"]`);
        if (subjectElement) {
            subjectElement.remove();
            this.updatePreview();
        }
    }
    
    calculateSubjectTotal(subjectId) {
        const subjectDiv = document.querySelector(`[data-subject-id="${subjectId}"]`);
        if (!subjectDiv) return;
        
        const theoryInput = subjectDiv.querySelector('.theory-marks');
        const practicalInput = subjectDiv.querySelector('.practical-marks');
        const totalDiv = subjectDiv.querySelector('.total-marks');
        const gradeDiv = subjectDiv.querySelector('.subject-grade');
        
        const theoryMarks = parseInt(theoryInput.value) || 0;
        const practicalMarks = parseInt(practicalInput.value) || 0;
        const total = theoryMarks + practicalMarks;
        
        totalDiv.textContent = total;
        
        const grade = this.calculateGrade(total);
        gradeDiv.textContent = grade;
        gradeDiv.className = `calculated-field subject-grade grade-${grade.toLowerCase().replace('+', '-plus')}`;
    }
    
    calculateGrade(marks) {
        for (const [grade, range] of Object.entries(this.gradingScale)) {
            if (marks >= range.min && marks <= range.max) {
                return grade;
            }
        }
        return 'F';
    }
    
    calculateOverallResults() {
        const subjects = document.querySelectorAll('.subject-entry');
        let totalMarksObtained = 0;
        let totalMaxMarks = 0;
        let allSubjectsPassed = true;
        
        subjects.forEach(subject => {
            const theoryMarks = parseInt(subject.querySelector('.theory-marks').value) || 0;
            const practicalMarks = parseInt(subject.querySelector('.practical-marks').value) || 0;
            const totalMarks = theoryMarks + practicalMarks;
            
            totalMarksObtained += totalMarks;
            totalMaxMarks += this.maxMarksPerSubject;
            
            if (totalMarks < this.passingMarks) {
                allSubjectsPassed = false;
            }
        });
        
        const percentage = totalMaxMarks > 0 ? (totalMarksObtained / totalMaxMarks * 100) : 0;
        const overallGrade = this.calculateGrade(percentage);
        const result = allSubjectsPassed && percentage >= this.passingMarks ? 'PASS' : 'FAIL';
        
        return {
            totalMarksObtained,
            totalMaxMarks,
            percentage: percentage.toFixed(2),
            overallGrade,
            result
        };
    }
    
    updatePreview() {
        // Update student information
        this.updatePreviewField('studentName', 'previewStudentName');
        this.updatePreviewField('rollNumber', 'previewRollNumber');
        this.updatePreviewField('class', 'previewClass');
        this.updatePreviewField('section', 'previewSection');
        this.updatePreviewField('academicYear', 'previewAcademicYear');
        this.updatePreviewField('dateOfBirth', 'previewDateOfBirth');
        
        // Update school information
        this.updatePreviewField('schoolName', 'previewSchoolName');
        this.updatePreviewField('schoolAddress', 'previewSchoolAddress');
        this.updatePreviewField('principalName', 'previewPrincipalName');
        this.updatePreviewField('issueDate', 'previewIssueDate');
        this.updatePreviewField('remarks', 'previewRemarks');
        
        // Update marks table
        this.updateMarksTable();
        
        // Update summary
        this.updateSummary();
    }
    
    updatePreviewField(inputId, previewId) {
        const input = document.getElementById(inputId);
        const preview = document.getElementById(previewId);
        
        if (input && preview) {
            preview.textContent = input.value || '-';
        }
    }
    
    updateMarksTable() {
        const tableBody = document.getElementById('previewMarksTable');
        const subjects = document.querySelectorAll('.subject-entry');
        
        if (!tableBody) return;
        
        tableBody.innerHTML = '';
        
        subjects.forEach((subject, index) => {
            const subjectName = subject.querySelector('.subject-name').value || `Subject ${index + 1}`;
            const theoryMarks = subject.querySelector('.theory-marks').value || '0';
            const practicalMarks = subject.querySelector('.practical-marks').value || '0';
            const totalMarks = subject.querySelector('.total-marks').textContent;
            const grade = subject.querySelector('.subject-grade').textContent;
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td style="text-align: left">${subjectName}</td>
                <td>${theoryMarks}</td>
                <td>${practicalMarks}</td>
                <td><strong>${totalMarks}</strong></td>
                <td><strong class="grade-${grade.toLowerCase().replace('+', '-plus')}">${grade}</strong></td>
            `;
            
            tableBody.appendChild(row);
        });
    }
    
    updateSummary() {
        const results = this.calculateOverallResults();
        
        // Update form summary
        const totalMarksEl = document.getElementById('totalMarks');
        const totalPercentageEl = document.getElementById('totalPercentage');
        const overallGradeEl = document.getElementById('overallGrade');
        
        if (totalMarksEl) totalMarksEl.textContent = `${results.totalMarksObtained}/${results.totalMaxMarks}`;
        if (totalPercentageEl) totalPercentageEl.textContent = `${results.percentage}%`;
        if (overallGradeEl) overallGradeEl.textContent = results.overallGrade;
        
        // Update preview summary
        const previewTotalMarksEl = document.getElementById('previewTotalMarks');
        const previewPercentageEl = document.getElementById('previewPercentage');
        const previewOverallGradeEl = document.getElementById('previewOverallGrade');
        const previewResultEl = document.getElementById('previewResult');
        
        if (previewTotalMarksEl) previewTotalMarksEl.textContent = `${results.totalMarksObtained}/${results.totalMaxMarks}`;
        if (previewPercentageEl) previewPercentageEl.textContent = `${results.percentage}%`;
        if (previewOverallGradeEl) previewOverallGradeEl.textContent = results.overallGrade;
        
        if (previewResultEl) {
            previewResultEl.textContent = results.result;
            previewResultEl.className = `result-status ${results.result.toLowerCase()}`;
        }
    }
    
    processPhotoFile(file) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Please upload an image file (JPG, PNG, GIF)');
            return;
        }
        
        // Validate file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
            alert('File size must be less than 5MB');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const photoPreview = document.getElementById('photoPreview');
            const uploadPlaceholder = document.querySelector('#photoUploadArea .upload-placeholder');
            
            if (photoPreview && uploadPlaceholder) {
                photoPreview.src = e.target.result;
                photoPreview.classList.remove('hidden');
                uploadPlaceholder.style.display = 'none';
                
                // Update preview
                const previewPhoto = document.getElementById('previewStudentPhoto');
                if (previewPhoto) {
                    previewPhoto.src = e.target.result;
                    previewPhoto.style.display = 'block';
                }
            }
        };
        
        reader.readAsDataURL(file);
    }
    
    processSignatureFile(file) {
        if (!file.type.startsWith('image/')) {
            alert('Please upload an image file');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const signaturePreview = document.getElementById('signaturePreview');
            const uploadPlaceholder = document.querySelector('#signatureUploadArea .upload-placeholder');
            
            if (signaturePreview && uploadPlaceholder) {
                signaturePreview.src = e.target.result;
                signaturePreview.classList.remove('hidden');
                uploadPlaceholder.style.display = 'none';
                
                // Update preview
                const previewSignature = document.getElementById('previewSignature');
                if (previewSignature) {
                    previewSignature.src = e.target.result;
                    previewSignature.style.display = 'block';
                }
            }
        };
        
        reader.readAsDataURL(file);
    }
    
    printMarksheet() {
        // Validate required fields
        const requiredFields = ['studentName', 'rollNumber', 'class', 'academicYear', 'schoolName', 'issueDate'];
        const missingFields = [];
        
        requiredFields.forEach(field => {
            const input = document.getElementById(field);
            if (!input || !input.value.trim()) {
                missingFields.push(field.replace(/([A-Z])/g, ' $1').toLowerCase());
            }
        });
        
        if (missingFields.length > 0) {
            alert(`Please fill in the following required fields:\n${missingFields.join('\n')}`);
            return;
        }
        
        // Check if at least one subject exists
        const subjects = document.querySelectorAll('.subject-entry');
        if (subjects.length === 0) {
            alert('Please add at least one subject');
            return;
        }
        
        // Print the marksheet
        window.print();
    }
    
    clearForm() {
        if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
            // Clear all form inputs
            const form = document.getElementById('marksheetForm');
            const inputs = form.querySelectorAll('input, textarea, select');
            inputs.forEach(input => {
                if (input.type !== 'file') {
                    input.value = '';
                }
            });
            
            // Clear file inputs specifically
            const photoInput = document.getElementById('studentPhoto');
            const signatureInput = document.getElementById('principalSignature');
            if (photoInput) photoInput.value = '';
            if (signatureInput) signatureInput.value = '';
            
            // Clear uploaded photo
            const photoPreview = document.getElementById('photoPreview');
            const photoPlaceholder = document.querySelector('#photoUploadArea .upload-placeholder');
            if (photoPreview && photoPlaceholder) {
                photoPreview.classList.add('hidden');
                photoPreview.src = '';
                photoPlaceholder.style.display = 'block';
            }
            
            // Clear uploaded signature
            const signaturePreview = document.getElementById('signaturePreview');
            const signaturePlaceholder = document.querySelector('#signatureUploadArea .upload-placeholder');
            if (signaturePreview && signaturePlaceholder) {
                signaturePreview.classList.add('hidden');
                signaturePreview.src = '';
                signaturePlaceholder.style.display = 'block';
            }
            
            // Clear preview images
            const previewPhoto = document.getElementById('previewStudentPhoto');
            const previewSignature = document.getElementById('previewSignature');
            if (previewPhoto) {
                previewPhoto.style.display = 'none';
                previewPhoto.src = '';
            }
            if (previewSignature) {
                previewSignature.style.display = 'none';
                previewSignature.src = '';
            }
            
            // Remove all subjects and add defaults
            const container = document.getElementById('subjectsContainer');
            if (container) {
                container.innerHTML = '';
            }
            this.subjectCounter = 0;
            
            // Reset default values
            document.getElementById('schoolName').value = 'ABC Public School';
            document.getElementById('schoolAddress').value = '123 Education Street, City - 123456';
            document.getElementById('principalName').value = 'Dr. John Smith';
            this.setCurrentDate();
            
            // Re-add default subjects
            this.addDefaultSubjects();
            
            // Update preview
            this.updatePreview();
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.marksheetApp = new MarksheetGenerator();
});