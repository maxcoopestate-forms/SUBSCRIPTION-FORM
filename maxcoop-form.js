// MAXCOOP Subscription Form - With PDF Generation and Email Sending
// ========================================================================

// IMPORTANT: Replace these with your actual EmailJS credentials
// Get them from: https://www.emailjs.com/
const EMAILJS_CONFIG = {
    serviceID: 'service_uvjlho9',      // Replace with your EmailJS Service ID
    templateID: 'template_fkb5ssq',    // Replace with your EmailJS Template ID
    publicKey: 'RBO6mnqrVLP293RXO'       // Replace with your EmailJS Public Key
};

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('maxcoopForm');
    const loadingIndicator = document.getElementById('loadingIndicator');

    // Initialize EmailJS
    emailjs.init(EMAILJS_CONFIG.publicKey);

    // Auto-set today's date for declaration
    const today = new Date().toISOString().split('T')[0];
    if (form.declarationDate && !form.declarationDate.value) {
        form.declarationDate.value = today;
    }

    // Form submission handler
    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Validate form
        if (!validateForm()) {
            return;
        }

        // Show loading indicator
        loadingIndicator.style.display = 'flex';

        try {
            // Collect form data
            const formData = collectFormData();

            // Generate PDF
            const pdfBlob = await generatePDF(formData);

            // Send email with PDF attachment
            await sendEmail(formData, pdfBlob);

            // Hide loading
            loadingIndicator.style.display = 'none';

            // Success message
            alert('✅ SUCCESS!\n\nYour subscription form has been submitted successfully!\n\nA PDF copy has been sent to maxcoopforms@gmail.com\n\nThank you for choosing MAXCOOP!');

            // Optional: Reset form after submission
            // form.reset();

        } catch (error) {
            console.error('Submission error:', error);
            loadingIndicator.style.display = 'none';
            alert('❌ OOPS!\n\nThere was an error submitting your form.\n\nPlease try again or contact us at 5402057281\n\nError: ' + error.message);
        }
    });

    // Validate form
    function validateForm() {
        const requiredFields = form.querySelectorAll('[required]');
        let isValid = true;
        let firstInvalidField = null;

        requiredFields.forEach(field => {
            // Check for radio buttons and checkboxes
            if (field.type === 'radio') {
                const radioGroup = form.querySelectorAll(`input[name="${field.name}"]`);
                const isChecked = Array.from(radioGroup).some(radio => radio.checked);
                
                if (!isChecked) {
                    isValid = false;
                    if (!firstInvalidField) firstInvalidField = field;
                    field.parentElement.parentElement.style.borderLeft = '3px solid #dc2626';
                } else {
                    field.parentElement.parentElement.style.borderLeft = 'none';
                }
            } else if (field.type === 'checkbox') {
                const checkboxGroup = form.querySelectorAll(`input[name="${field.name}"]`);
                const isChecked = Array.from(checkboxGroup).some(cb => cb.checked);
                
                if (!isChecked) {
                    isValid = false;
                    if (!firstInvalidField) firstInvalidField = field;
                    field.parentElement.style.borderLeft = '3px solid #dc2626';
                } else {
                    field.parentElement.style.borderLeft = 'none';
                }
            } else {
                // Regular inputs
                if (!field.value.trim()) {
                    isValid = false;
                    if (!firstInvalidField) firstInvalidField = field;
                    field.style.borderColor = '#dc2626';
                } else {
                    field.style.borderColor = '#cbd5e1';
                }
            }
        });

        if (!isValid) {
            alert('⚠️ Please fill in all required fields marked with (*)\n\nScroll up to see highlighted fields.');
            if (firstInvalidField) {
                firstInvalidField.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }

        return isValid;
    }

    // Collect all form data
    function collectFormData() {
        return {
            subscriber: {
                title: getCheckedValue('title'),
                surname: form.surname.value,
                otherNames: form.otherNames.value,
                fullName: `${getCheckedValue('title')} ${form.surname.value} ${form.otherNames.value}`,
                spouseName: form.spouseSurname.value && form.spouseOtherNames.value 
                    ? `${form.spouseSurname.value} ${form.spouseOtherNames.value}` 
                    : 'N/A',
                address: form.address.value,
                dob: form.dob.value,
                gender: form.gender.value,
                maritalStatus: form.maritalStatus.value,
                nationality: form.nationality.value,
                occupation: form.occupation.value || 'N/A',
                employerName: form.employerName.value || 'N/A',
                businessNature: form.businessNature.value || 'N/A',
                yearsOfEmployment: form.yearsOfEmployment.value || 'N/A',
                countryOfResidence: form.countryOfResidence.value,
                languageSpoken: form.languageSpoken.value || 'N/A',
                email: form.email.value,
                otherIncome: form.otherIncome.value || 'N/A',
                mobileNumber: form.mobileNumber.value,
                idType: getCheckedValues('idType').join(', ') || 'N/A',
                pep: form.pep.value,
                pepCategory: form.pepCategory.value || 'N/A'
            },
            nextOfKin: {
                name: form.nokName.value,
                phone: form.nokPhone.value,
                email: form.nokEmail.value || 'N/A',
                address: form.nokAddress.value
            },
            declaration: {
                plotType: getCheckedValue('plotType'),
                numberOfPlots: form.numberOfPlots.value,
                plotSize: getCheckedValue('plotSize'),
                cornerPiece: getCheckedValue('cornerPiece') || 'No',
                paymentPlan: getCheckedValue('paymentPlan'),
                signature: form.signature.value,
                date: form.declarationDate.value
            },
            referral: {
                name: form.referralName.value || 'N/A',
                phone: form.referralPhone.value || 'N/A',
                email: form.referralEmail.value || 'N/A',
                date: form.referralDate.value || 'N/A'
            },
            submissionDate: new Date().toLocaleString()
        };
    }

    // Generate PDF from form data
    async function generatePDF(data) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Colors
        const primaryBlue = [30, 58, 138];
        const primaryRed = [220, 38, 38];
        const darkGray = [51, 51, 51];

        let yPos = 20;

        // Header
        doc.setFillColor(...primaryBlue);
        doc.rect(0, 0, 210, 40, 'F');
        
        doc.setFontSize(24);
        doc.setTextColor(255, 255, 255);
        doc.text('MAXCOOP', 105, 15, { align: 'center' });
        
        doc.setFontSize(18);
        doc.text('COOP CITY, ANAMBRA', 105, 25, { align: 'center' });
        
        doc.setFontSize(14);
        doc.setTextColor(251, 191, 36);
        doc.text('SUBSCRIPTION FORM', 105, 33, { align: 'center' });

        yPos = 50;

        // Helper function to add section header
        function addSectionHeader(title) {
            doc.setFillColor(...primaryRed);
            doc.rect(10, yPos, 190, 10, 'F');
            doc.setFontSize(12);
            doc.setTextColor(255, 255, 255);
            doc.text(title, 15, yPos + 7);
            yPos += 15;
            doc.setTextColor(...darkGray);
        }

        // Helper function to add field
        function addField(label, value, fullWidth = false) {
            if (yPos > 270) {
                doc.addPage();
                yPos = 20;
            }

            doc.setFontSize(9);
            doc.setFont(undefined, 'bold');
            doc.text(label + ':', 15, yPos);
            
            doc.setFont(undefined, 'normal');
            const valueText = String(value || 'N/A');
            
            if (fullWidth) {
                const splitText = doc.splitTextToSize(valueText, 170);
                doc.text(splitText, 15, yPos + 5);
                yPos += 5 + (splitText.length * 5);
            } else {
                doc.text(valueText, 80, yPos);
                yPos += 7;
            }
        }

        // SECTION 1: SUBSCRIBER'S DETAILS
        addSectionHeader('SECTION 1: SUBSCRIBER\'S DETAILS');
        
        addField('Full Name', data.subscriber.fullName);
        addField('Spouse Name', data.subscriber.spouseName);
        addField('Address', data.subscriber.address, true);
        addField('Date of Birth', data.subscriber.dob);
        addField('Gender', data.subscriber.gender);
        addField('Marital Status', data.subscriber.maritalStatus);
        addField('Nationality', data.subscriber.nationality);
        addField('Occupation', data.subscriber.occupation);
        addField('Employer\'s Name', data.subscriber.employerName);
        addField('Nature of Business', data.subscriber.businessNature);
        addField('Years of Employment', data.subscriber.yearsOfEmployment);
        addField('Country of Residence', data.subscriber.countryOfResidence);
        addField('Language Spoken', data.subscriber.languageSpoken);
        addField('Email Address', data.subscriber.email);
        addField('Mobile Number', data.subscriber.mobileNumber);
        addField('Other Income Source', data.subscriber.otherIncome);
        addField('ID Type', data.subscriber.idType);
        addField('Politically Exposed', data.subscriber.pep);
        addField('PEP Category', data.subscriber.pepCategory);

        yPos += 5;

        // SECTION 2: NEXT OF KIN
        addSectionHeader('SECTION 2: NEXT OF KIN');
        
        addField('Name', data.nextOfKin.name);
        addField('Phone Number', data.nextOfKin.phone);
        addField('Email Address', data.nextOfKin.email);
        addField('Address', data.nextOfKin.address, true);

        yPos += 5;

        // SECTION 3: SUBSCRIBER'S DECLARATION
        addSectionHeader('SECTION 3: SUBSCRIBER\'S DECLARATION');
        
        addField('Type of Plot', data.declaration.plotType);
        addField('Number of Plots', data.declaration.numberOfPlots);
        addField('Plot Size', data.declaration.plotSize);
        addField('Corner Piece', data.declaration.cornerPiece);
        addField('Payment Plan', data.declaration.paymentPlan);
        addField('Signature', data.declaration.signature);
        addField('Date', data.declaration.date);

        yPos += 5;

        // REFERRAL DETAILS (if provided)
        if (data.referral.name !== 'N/A') {
            addSectionHeader('REFERRAL DETAILS');
            addField('Referral Name', data.referral.name);
            addField('Referral Phone', data.referral.phone);
            addField('Referral Email', data.referral.email);
            addField('Referral Date', data.referral.date);
        }

        // Footer
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text('Submitted on: ' + data.submissionDate, 105, 285, { align: 'center' });
        doc.text('MAX CONSTRUCTION HOUSING COOP | 5402057281', 105, 290, { align: 'center' });

        // Convert to blob
        return doc.output('blob');
    }

    // Send email with PDF attachment
    async function sendEmail(formData, pdfBlob) {
        // Convert blob to base64
        const base64PDF = await blobToBase64(pdfBlob);

        // Prepare email parameters
        const emailParams = {
            to_email: 'maxcoopforms@gmail.com',
            from_name: formData.subscriber.fullName,
            from_email: formData.subscriber.email,
            subscriber_name: formData.subscriber.fullName,
            mobile_number: formData.subscriber.mobileNumber,
            plot_type: formData.declaration.plotType,
            number_of_plots: formData.declaration.numberOfPlots,
            payment_plan: formData.declaration.paymentPlan,
            submission_date: formData.submissionDate,
            pdf_attachment: base64PDF,
            pdf_name: `MAXCOOP_${formData.subscriber.surname}_${Date.now()}.pdf`
        };

        // Send via EmailJS
        return emailjs.send(
            EMAILJS_CONFIG.serviceID,
            EMAILJS_CONFIG.templateID,
            emailParams
        );
    }

    // Convert blob to base64
    function blobToBase64(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }

    // Helper function to get checked radio value
    function getCheckedValue(name) {
        const checked = form.querySelector(`input[name="${name}"]:checked`);
        return checked ? checked.value : '';
    }

    // Helper function to get all checked checkbox values
    function getCheckedValues(name) {
        const checked = form.querySelectorAll(`input[name="${name}"]:checked`);
        return Array.from(checked).map(cb => cb.value);
    }

    // Single checkbox selection for certain groups
    function setupSingleCheckbox(name) {
        const checkboxes = form.querySelectorAll(`input[name="${name}"]`);
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                if (this.checked) {
                    checkboxes.forEach(cb => {
                        if (cb !== this) cb.checked = false;
                    });
                }
            });
        });
    }

    // Apply single selection to these checkbox groups
    setupSingleCheckbox('title');
    setupSingleCheckbox('plotType');
    setupSingleCheckbox('plotSize');
    setupSingleCheckbox('paymentPlan');

    // Auto-format phone numbers
    const phoneInputs = form.querySelectorAll('input[type="tel"]');
    phoneInputs.forEach(input => {
        input.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 11) {
                value = value.slice(0, 11);
            }
            e.target.value = value;
        });
    });

    // Prevent spaces in email fields
    const emailInputs = form.querySelectorAll('input[type="email"]');
    emailInputs.forEach(input => {
        input.addEventListener('input', function(e) {
            e.target.value = e.target.value.replace(/\s/g, '');
        });
    });
});
