const mongoose = require('mongoose')
const slugify = require('slugify')

const portfolioPostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    excerpt: {
      type: String,
      trim: true
    },
    content: {
      type: String,
      trim: true
    },
    projectDate: {
      type: Date
    },
    location: {
      type: String,
      trim: true
    },
    published: {
      type: Boolean,
      default: false
    },
    mediaIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Media'
      }
    ],
    seo: {
      metaTitle: { type: String, trim: true },
      metaDescription: { type: String, trim: true },
      metaKeywords: { type: String, trim: true }
    }
  },
  {
    timestamps: true
  }
)

// Note: slug index is automatically created by unique: true
portfolioPostSchema.index({ published: 1 })
portfolioPostSchema.index({ createdAt: -1 })

// Generate slug from title before saving
portfolioPostSchema.pre('save', async function (next) {
  if (this.isModified('title') || this.isNew) {
    let baseSlug = slugify(this.title, { lower: true, strict: true })
    let slug = baseSlug
    let counter = 1

    while (
      await mongoose
        .model('PortfolioPost')
        .exists({ slug, _id: { $ne: this._id } })
    ) {
      slug = `${baseSlug}-${counter}`
      counter++
    }

    this.slug = slug
  }
  next()
})

module.exports = mongoose.model('PortfolioPost', portfolioPostSchema)
