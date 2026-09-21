import { describe, it, expect } from 'vitest'
import { buildFileUrls, updateFileListUrls, getUrlByFormat } from '../src/utils/upload/urlBuilder'

describe('urlBuilder', () => {
    it('buildFileUrls 按前缀拼接文件 ID（自托管渠道）', () => {
        const urls = buildFileUrls('abc123.jpg', 'a.jpg', 'https://img.example.com/')
        expect(urls.finalURL).toBe('https://img.example.com/abc123.jpg')
        expect(urls.mdURL).toBe('![a.jpg](https://img.example.com/abc123.jpg)')
    })

    it('updateFileListUrls 跳过 CNB 直链文件，不二次拼接', () => {
        const fileList = [
            {
                name: 'cnb.webp',
                uploadChannel: 'cnb',
                srcID: '',
                finalURL: 'https://cnb.cool/zzgs219/cdn-img/-/imgs/x/abc.webp',
                mdURL: '![cnb.webp](https://cnb.cool/zzgs219/cdn-img/-/imgs/x/abc.webp)',
            },
            {
                name: 'tg.jpg',
                uploadChannel: 'telegram',
                srcID: 'tgfileid',
                finalURL: 'https://img.example.com/tgfileid',
            },
        ]
        updateFileListUrls(fileList, 'https://new-prefix.example.com/')
        // CNB 直链保持原样，不被拼接
        expect(fileList[0].finalURL).toBe('https://cnb.cool/zzgs219/cdn-img/-/imgs/x/abc.webp')
        // TG 渠道正常重建为新前缀
        expect(fileList[1].finalURL).toBe('https://new-prefix.example.com/tgfileid')
    })

    it('getUrlByFormat 未知格式回退 finalURL', () => {
        const file = { finalURL: 'https://a/b', mdURL: '![]()' }
        expect(getUrlByFormat(file, 'md')).toBe('![]()')
        expect(getUrlByFormat(file, 'unknown')).toBe('https://a/b')
    })
})
