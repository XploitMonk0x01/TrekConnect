'use server'

import { getCache, setCache } from '@/lib/cache'

const youtubeLinksText = `
audens col trek: https://youtu.be/QlY-jBEyetI?si=FEsZErTsqUVwU7Cp
bali pass trek uttarakhand: https://www.youtube.com/watch?v=9t_y0d7COq0
beas kund himachal: https://www.youtube.com/watch?v=u5P4SHcegM8
bhrigu lake manali: https://www.youtube.com/watch?v=uwmLmd_1kIA
brahmatal winter trek: https://www.youtube.com/watch?v=7IshSjZENZo&t=869s
Dayara Bugyal Trek: https://www.youtube.com/watch?v=n9HDNkKJckU
dodital lake trek: https://www.youtube.com/watch?v=PCrAL7UuRuQ
Gaumukh Tapovan Trek: https://www.youtube.com/watch?v=kYD67aqcCrY&t=1084s
himachal hampta pass: https://www.youtube.com/watch?v=IXrRxiSL1VA
har ki dun uttarakhand: https://www.youtube.com/watch?v=THGyK8RslLE
kalpeshwar temple trek: https://www.youtube.com/watch?v=LoErhbH2kpI
kang yatse ladakh: https://www.youtube.com/watch?v=1Y1hHhLLXMM&t=755s
kareri lake dhauladhar: https://www.youtube.com/watch?v=GrZZjMGJUn0
kedarkantha winter trek: https://www.youtube.com/watch?v=8LssxY3lDoM
kuari pass trek uttarakhand: https://www.youtube.com/watch?v=rmuuxRaCSH0&t=588s
lamayuru alchi ladakh: https://www.youtube.com/watch?v=x7lcEObXiWE
madhyamaheshwar trek panch kedar: https://www.youtube.com/watch?v=cjN2cRoP7qg
ladakh markha valley: https://www.youtube.com/watch?v=-h8nKzjO-oc
nag tibba trek mussoorie: https://www.youtube.com/watch?v=eEOiH_WrE4c
panch kedar pilgrimage trek: https://www.youtube.com/watch?v=mqR5tUS3X5E
pindari glacier kumaon: https://www.youtube.com/watch?v=NIwpUMXfkb8
uttarakhand roopkund trek: https://www.youtube.com/watch?v=vr78nabDi6Y
rudranath trek uttarakhand: https://www.youtube.com/watch?v=LZ4XlqGtk6o
satopanth tal uttarakhand: https://www.youtube.com/watch?v=4c6UE65zsFs&t=296s
ladakh sham valley trek: https://www.youtube.com/watch?v=yNouR0VsxAA
tungnath chandrashila trek: https://www.youtube.com/watch?v=p1tIKyNQJjk
valley of flowers hemkund sahib: https://www.youtube.com/watch?v=BXuM5sfuYsc
vasuki tal kedarnath: https://www.youtube.com/watch?v=LMZjq9nYRBs
`

const youtubeLinks = new Map<string, string>()
youtubeLinksText
  .split('\n')
  .filter((line) => line.includes(':'))
  .forEach((line) => {
    const parts = line.split(':')
    const trekName = parts[0].trim()
    const url = parts.slice(1).join(':').trim()
    youtubeLinks.set(trekName.toLowerCase(), url)
  })

function extractYouTubeVideoId(url: string): string | null {
  if (!url) return null
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*$/
  const match = url.match(regExp)
  return match && match[2].length === 11 ? match[2] : null
}

export async function searchYouTubeVideoId(
  query: string
): Promise<string | null> {
  const cacheKey = `youtube-${query}`
  const cachedVideoId = getCache<string>(cacheKey)
  if (cachedVideoId) {
    return cachedVideoId
  }

  const normalizedQuery = query.toLowerCase()
  const url = youtubeLinks.get(normalizedQuery)
  if (url) {
    const videoId = extractYouTubeVideoId(url)
    if (videoId) {
      setCache(cacheKey, videoId)
    }
    return videoId
  }
  console.warn(`No YouTube video found for query: "${query}"`)
  return null
}
