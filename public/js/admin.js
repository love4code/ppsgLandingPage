// Admin JavaScript

// Sidebar toggle for mobile
function toggleSidebar () {
  const sidebar = document.querySelector('.admin-sidebar')
  const overlay = document.querySelector('.sidebar-overlay')
  sidebar.classList.toggle('open')
  overlay.classList.toggle('active')
}

// Handle flash messages
document.addEventListener('DOMContentLoaded', function () {
  // Auto-dismiss alerts after 5 seconds
  const alerts = document.querySelectorAll('.alert')
  alerts.forEach(alert => {
    setTimeout(() => {
      const bsAlert = new bootstrap.Alert(alert)
      bsAlert.close()
    }, 5000)
  })
})

// Media upload with progress
document.addEventListener('DOMContentLoaded', function () {
  const uploadForm = document.getElementById('uploadForm')
  if (!uploadForm) return

  uploadForm.addEventListener('submit', async function (e) {
    e.preventDefault()

    const fileInput = document.getElementById('imageFiles')
    const files = fileInput.files

    if (files.length === 0) {
      alert('Please select at least one image')
      return
    }

    if (files.length > 20) {
      alert('Maximum 20 images allowed')
      return
    }

    const uploadBtn = document.getElementById('uploadBtn')
    const uploadProgress = document.getElementById('uploadProgress')
    const fileProgress = document.getElementById('fileProgress')
    const overallProgress = uploadProgress.querySelector('.progress-bar')

    uploadBtn.disabled = true
    uploadProgress.style.display = 'block'
    fileProgress.innerHTML = ''
    overallProgress.style.width = '0%'

    const formData = new FormData()
    for (let i = 0; i < files.length; i++) {
      formData.append('images', files[i])
    }

    try {
      const xhr = new XMLHttpRequest()

      xhr.upload.addEventListener('progress', function (e) {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100
          overallProgress.style.width = percentComplete + '%'
        }
      })

      xhr.addEventListener('load', function () {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText)
          if (response.success) {
            alert('Images uploaded successfully!')
            location.reload()
          } else {
            alert('Upload failed: ' + (response.error || 'Unknown error'))
            uploadBtn.disabled = false
          }
        } else {
          alert('Upload failed')
          uploadBtn.disabled = false
        }
      })

      xhr.addEventListener('error', function () {
        alert('Upload error occurred')
        uploadBtn.disabled = false
      })

      xhr.open('POST', '/admin/media/upload')
      xhr.send(formData)
    } catch (error) {
      console.error('Upload error:', error)
      alert('Upload failed')
      uploadBtn.disabled = false
    }
  })
})

// Update media title/alt
function updateMedia (mediaId, input) {
  const card = input.closest('.card')
  const titleInput = card.querySelector('[data-field="title"]')
  const altInput = card.querySelector('[data-field="alt"]')

  fetch(`/admin/media/${mediaId}/update`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      title: titleInput.value,
      alt: altInput.value
    })
  })
    .then(response => response.json())
    .then(data => {
      if (!data.success) {
        alert('Error: ' + (data.error || 'Failed to update media'))
      }
    })
    .catch(error => {
      console.error('Update error:', error)
      alert('Error updating media')
    })
}

// Delete media
function deleteMedia (mediaId) {
  if (
    !confirm(
      'Are you sure you want to delete this media? This action cannot be undone.'
    )
  ) {
    return
  }

  fetch(`/admin/media/${mediaId}/delete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        document.querySelector(`[data-media-id="${mediaId}"]`).remove()
        alert('Media deleted successfully')
      } else {
        alert('Error: ' + (data.error || 'Failed to delete media'))
      }
    })
    .catch(error => {
      console.error('Delete error:', error)
      alert('Error deleting media')
    })
}
