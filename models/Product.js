const mongoose = require('mongoose')
const slugify = require('slugify')

const productSchema = new mongoose.Schema(
  {
    name: {
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
    shortDescription: {
      type: String,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    price: {
      type: Number,
      min: 0
    },
    featured: {
      type: Boolean,
      default: false
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
    sizes: [
      {
        type: String,
        trim: true
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
productSchema.index({ published: 1, featured: 1 })
productSchema.index({ createdAt: -1 })

// Generate slug from name before saving
productSchema.pre('save', async function (next) {
  if (this.isModified('name') || this.isNew) {
    let baseSlug = slugify(this.name, { lower: true, strict: true })
    let slug = baseSlug
    let counter = 1

    while (
      await mongoose.model('Product').exists({ slug, _id: { $ne: this._id } })
    ) {
      slug = `${baseSlug}-${counter}`
      counter++
    }

    this.slug = slug
  }
  next()
})

module.exports = mongoose.model('Product', productSchema)
