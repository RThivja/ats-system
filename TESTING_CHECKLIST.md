# 🧪 ATS System - Manual Testing Checklist

## Pre-Testing Setup
- [ ] Backend running on http://localhost:5000
- [ ] Frontend running on http://localhost:5173
- [ ] Database connected
- [ ] Clear browser cache (`Ctrl + Shift + R`)

---

## 1️⃣ Home Page & Authentication

### Home Page
- [ ] Page loads without errors
- [ ] Logo displays correctly (not "J")
- [ ] Job listings appear
- [ ] "Sign In" and "Sign Up" buttons visible
- [ ] "For Recruiters: Post a Job" button visible

### Recruiter Registration
- [ ] Click "Sign Up"
- [ ] Select "Recruiter" role
- [ ] Fill form:
  - Name: Test Recruiter
  - Email: recruiter@test.com
  - Password: test123
  - Phone: 1234567890
  - Company: Test Company
- [ ] Submit form
- [ ] Green success toast appears
- [ ] Modal closes
- [ ] Can login immediately

### Recruiter Login
- [ ] Click "Sign In"
- [ ] Enter: recruiter@test.com / test123
- [ ] Submit
- [ ] Redirects to Dashboard
- [ ] Header shows user name
- [ ] Logout button visible

---

## 2️⃣ Recruiter Dashboard

### Dashboard Statistics
- [ ] "Total Jobs" card shows count
- [ ] "Active Jobs" card shows count
- [ ] "Total Applications" card shows count
- [ ] "Pending Review" card shows count (APPLIED status only)
- [ ] Recent applications list displays
- [ ] "Dashboard" link is highlighted (blue background)

### Pending Applications
- [ ] If pending apps exist, list shows all jobs with pending apps
- [ ] Each job has "Review →" button
- [ ] Clicking "Review →" navigates to applications page
- [ ] Clicking "Pending Review" card navigates to first pending job

---

## 3️⃣ Create Job

### Navigation
- [ ] Click "➕ Post Job" button
- [ ] Redirects to /create-job
- [ ] Form displays correctly

### Job Form
- [ ] Fill all fields:
  - Title: Senior Full Stack Developer
  - Description: We are looking for an experienced developer...
  - Location: Remote
  - Job Type: Full-time
  - Salary Range: $80,000 - $120,000 (Optional - should work even if empty)
  - Required Skills: React, Node.js, TypeScript, MongoDB
  - Experience Required: SENIOR
  - Education Required: BACHELOR
  - Other Requirements: 5+ years experience
- [ ] Click "Post Job"
- [ ] Green success toast appears
- [ ] Redirects to "My Jobs"
- [ ] New job appears in list

### Validation
- [ ] Try submitting without title → Error
- [ ] Try submitting without description → Error
- [ ] Try submitting without skills → Error
- [ ] Salary field is optional (can be empty)

---

## 4️⃣ My Jobs

### Job List
- [ ] All posted jobs display
- [ ] Each job shows title, description, location, salary
- [ ] "View Applications" button appears
- [ ] "My Jobs" link is highlighted
- [ ] Job count matches dashboard

### View Applications
- [ ] Click "View Applications" on a job
- [ ] Redirects to /applications/:jobId
- [ ] "My Jobs" link stays highlighted (smart highlighting)

---

## 5️⃣ View Applications

### Applications List
- [ ] All applications for the job display
- [ ] Each card shows:
  - Applicant name, email, phone
  - Skills as blue badges
  - Experience level
  - Education level
  - Match score (percentage)
  - Application status
  - Cover letter
  - "📄 View CV" button (if CV exists)
  - Status dropdown

### Filters
- [ ] Filter by status (ALL, APPLIED, VIEWED, etc.)
- [ ] Filter by minimum match score
- [ ] Sort by match score / date
- [ ] Filters apply correctly
- [ ] Filtered cards have blue highlight
- [ ] Clear filters works

### Auto-Update Status
- [ ] When viewing applications with APPLIED status
- [ ] They auto-update to VIEWED
- [ ] Dashboard pending count decreases

### Update Status
- [ ] Change status dropdown
- [ ] Status updates immediately
- [ ] Toast notification appears
- [ ] Dashboard stats update

### View CV
- [ ] If applicant has CV, "📄 View CV" button shows
- [ ] If no CV, "No CV" gray box shows
- [ ] Clicking CV button opens in new tab

---

## 6️⃣ Applicant Registration & Login

### Applicant Registration
- [ ] Logout from recruiter
- [ ] Click "Sign Up"
- [ ] Select "Applicant" role
- [ ] Fill form:
  - Name: Test Applicant
  - Email: applicant@test.com
  - Password: test123
  - Phone: 9876543210
  - Skills: React, JavaScript, Node.js, Python
- [ ] Submit
- [ ] Success toast appears
- [ ] Can login

### Applicant Login
- [ ] Login with applicant@test.com / test123
- [ ] Redirects to home page
- [ ] Header shows user name
- [ ] No recruiter-specific buttons

---

## 7️⃣ Applicant Profile

### Navigate to Profile
- [ ] Go to http://localhost:5173/profile
- [ ] Profile page loads
- [ ] "My Profile" heading displays

### View Profile
- [ ] Name displays correctly
- [ ] Email displays correctly
- [ ] Phone displays correctly
- [ ] Skills show as blue badges (or "No skills added")
- [ ] Experience shows (or "Not specified")
- [ ] Education shows (or "Not specified")
- [ ] "Edit Profile" button visible

### Edit Profile
- [ ] Click "Edit Profile"
- [ ] Form appears with current data
- [ ] Update fields:
  - Name: Test Applicant Updated
  - Phone: 1111111111
  - Skills: React, Node.js, TypeScript, Python, MongoDB
  - Experience: JUNIOR
  - Education: BACHELOR
  - CV/Resume Link: https://drive.google.com/file/d/example
- [ ] Click "Save Changes"
- [ ] Green success toast: "✨ Profile updated successfully!"
- [ ] Form closes (view mode)
- [ ] Data displays correctly
- [ ] Skills show as badges
- [ ] Experience shows "JUNIOR"
- [ ] Education shows "BACHELOR"

### Validation
- [ ] Try saving without name → Red error toast
- [ ] Try saving without skills → Red error toast
- [ ] Try saving with empty skills → Error toast

### Cancel Edit
- [ ] Click "Edit Profile"
- [ ] Make changes
- [ ] Click "Cancel"
- [ ] Changes are discarded
- [ ] Original data remains

---

## 8️⃣ Browse & Apply to Jobs

### Browse Jobs
- [ ] Go to home page
- [ ] All jobs display
- [ ] Each job card shows:
  - Company letter logo (A, B, C...)
  - Job title
  - Company name
  - Location, job type, salary
  - Description (truncated)
  - Required skills as badges
  - "Apply Now" button

### Apply to Job
- [ ] Click "Apply Now" on a job
- [ ] Redirects to /jobs/:id
- [ ] Job details display
- [ ] Application form appears
- [ ] **CV auto-fills** from profile
- [ ] Green message: "✅ CV from your profile will be used"

### Fill Application
- [ ] Write cover letter: "I am very interested in this position..."
- [ ] CV URL is pre-filled (from profile)
- [ ] Can override CV URL if needed
- [ ] Click "Submit Application"
- [ ] Success message appears
- [ ] Redirects to "My Applications"

### Already Applied
- [ ] Try applying to same job again
- [ ] Shows "Already Applied!" message
- [ ] "View My Applications" button appears

---

## 9️⃣ My Applications

### Navigate
- [ ] Go to http://localhost:5173/my-applications
- [ ] Page loads

### Applications List
- [ ] All applications display
- [ ] Each card shows:
  - Job title
  - Company name
  - Application status (with color)
  - Match score
  - Applied date
  - Cover letter
- [ ] Status colors:
  - APPLIED: Orange
  - VIEWED: Blue
  - SHORTLISTED: Green
  - REJECTED: Red

### No Applications
- [ ] If no applications, shows "No applications yet"
- [ ] "Browse Jobs" button appears

---

## 🔟 End-to-End Flow

### Complete Recruiter Flow
1. [ ] Register as recruiter
2. [ ] Login
3. [ ] View dashboard (0 jobs, 0 applications)
4. [ ] Create 2 jobs
5. [ ] Dashboard updates (2 jobs)
6. [ ] View "My Jobs" (2 jobs appear)
7. [ ] Logout

### Complete Applicant Flow
1. [ ] Register as applicant
2. [ ] Login
3. [ ] Go to Profile
4. [ ] Add skills, experience, education, CV
5. [ ] Save profile
6. [ ] Browse jobs
7. [ ] Apply to both jobs
8. [ ] Check "My Applications" (2 applications)
9. [ ] Logout

### Recruiter Review Flow
1. [ ] Login as recruiter
2. [ ] Dashboard shows "2" pending review
3. [ ] Click "Review Now"
4. [ ] See applicant's application
5. [ ] View applicant CV (opens in new tab)
6. [ ] Update status to SHORTLISTED
7. [ ] Dashboard pending count decreases to 1
8. [ ] View second application
9. [ ] Update to REJECTED
10. [ ] Dashboard pending count = 0

### Applicant Check Status
1. [ ] Login as applicant
2. [ ] Go to "My Applications"
3. [ ] See updated statuses:
    - One SHORTLISTED (green)
    - One REJECTED (red)

---

## 🎨 UI/UX Checks

### Logo & Branding
- [ ] Browser tab shows professional icon (not "J")
- [ ] Header logo shows professional icon
- [ ] Job cards show company letter (A, B, C...)
- [ ] All logos consistent

### Navigation
- [ ] Active page link is highlighted (blue background)
- [ ] Dashboard active on /dashboard
- [ ] My Jobs active on /my-jobs AND /applications/:id
- [ ] Hover effects work
- [ ] Smooth transitions

### Notifications
- [ ] No browser `alert()` popups
- [ ] All notifications are toast messages
- [ ] Toast auto-dismisses after 3 seconds
- [ ] Can manually close toast
- [ ] Success = green
- [ ] Error = red
- [ ] Info = blue

### Responsive Design
- [ ] Test on different screen sizes
- [ ] Mobile view works
- [ ] Tablet view works
- [ ] Desktop view works

### Loading States
- [ ] Loading spinners appear when fetching data
- [ ] "Loading..." text shows
- [ ] No blank screens

---

## 🐛 Error Handling

### Network Errors
- [ ] Stop backend server
- [ ] Try any action
- [ ] Error toast appears
- [ ] No crashes

### Invalid Data
- [ ] Try registering with existing email
- [ ] Error message shows
- [ ] Try logging in with wrong password
- [ ] Error message shows

### Empty States
- [ ] No jobs → Shows "No Jobs Available"
- [ ] No applications → Shows "No applications yet"
- [ ] No skills → Shows "No skills added"

---

## ✅ Final Checks

### Security
- [ ] Can't access recruiter pages as applicant
- [ ] Can't access applicant pages as recruiter
- [ ] Logout clears session
- [ ] Can't view other users' data

### Data Persistence
- [ ] Logout and login again
- [ ] All data persists
- [ ] Jobs remain
- [ ] Applications remain
- [ ] Profile data remains

### Performance
- [ ] Pages load quickly
- [ ] No console errors
- [ ] No memory leaks
- [ ] Smooth animations

---

## 📊 Test Results Summary

**Total Tests:** _____ / _____

**Passed:** ✅ _____

**Failed:** ❌ _____

**Issues Found:** _____

---

## 🐛 Bugs Found

1. 
2. 
3. 

---

## 💡 Improvements Needed

1. 
2. 
3. 

---

**Tested By:** _________________

**Date:** _________________

**Status:** ⬜ PASS / ⬜ FAIL
