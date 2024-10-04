import re
import json
from janome.tokenizer import Tokenizer

# サンプルの同義語辞書
sample_dictionary = [
    {"word": "Cap", "synonyms": ["C", "容量", "Cap.", "Cap"]},
    {"word": "素子厚", "synonyms": ["誘電体厚"]},
    # 他のエントリーを追加
]

def build_synonym_map(dictionary):
    synonym_map = {}
    for entry in dictionary:
        standard_word = entry["word"]
        for synonym in entry["synonyms"]:
            synonym_map[synonym] = standard_word
    return synonym_map

def compile_pattern(synonym_map):
    # シノニムを長い順にソートして部分一致を防ぐ
    sorted_synonyms = sorted(synonym_map.keys(), key=lambda x: len(x), reverse=True)
    # 正規表現で特殊文字をエスケープ
    escaped_synonyms = [re.escape(syn) for syn in sorted_synonyms]
    # 正規表現を結合して一括マッチングする
    pattern = re.compile("|".join(escaped_synonyms))
    return pattern


def compile_pattern_with_extended_boundaries(synonym_map):
    """
    シノニムを長い順にソートし、前後に日本語および英字を含めた単語境界を考慮した正規表現パターンを作成します。
    """
    # シノニムを長い順にソートして部分一致を防ぐ
    sorted_synonyms = sorted(synonym_map.keys(), key=lambda x: len(x), reverse=True)
    # 正規表現で特殊文字をエスケープ
    escaped_synonyms = [re.escape(syn) for syn in sorted_synonyms]
    # 前後に日本語文字種および英字・数字を含める
    pattern = re.compile(
        r"(?<![\u4E00-\u9FFF\u3040-\u309F\u30A0-\u30FFA-Za-z0-9])(" +
        "|".join(escaped_synonyms) +
        r")(?![\u4E00-\u9FFF\u3040-\u309F\u30A0-\u30FFA-Za-z0-9])"
    )
    return pattern


def replace_synonyms(text, pattern, synonym_map):
    # マッチしたシノニムを対応する標準語に置換
    return pattern.sub(lambda match: synonym_map[match.group(0)], text)


def replace_synonyms_with_tokenizer(text, synonym_map):
    """
    形態素解析を使用して単語単位でシノニムを置換します。
    """
    tokenizer = Tokenizer()
    tokens = tokenizer.tokenize(text)
    replaced_tokens = []
    for token in tokens:
        surface = token.surface
        # シノニムマップに存在する場合は置換
        replaced = synonym_map.get(surface, surface)
        replaced_tokens.append(replaced)
    return ''.join(replaced_tokens)

def main():
    # シノニムマップの構築
    synonym_map = build_synonym_map(sample_dictionary)
    
    # 正規表現パターンのコンパイル
    pattern = compile_pattern(synonym_map)
    pattern_with_boundaries = compile_pattern_with_extended_boundaries(synonym_map)
    
    # 置換したいテキスト
    text = "このデバイスの容量は重要です。誘電体厚もチェックしてください。Cは容量を表します。CapやCap.も使われます。"
    
    # シノニムの置換
    replaced_text = replace_synonyms(text, pattern, synonym_map)
    replaced_text_with_bouldary = replace_synonyms(text, pattern_with_boundaries, synonym_map)
    replaced_text_with_tokenizer = replace_synonyms_with_tokenizer(text, synonym_map)
    
    print("元のテキスト:", text)
    print("置換後のテキスト:", replaced_text)
    print("置換後のテキスト(boundary):", replaced_text_with_bouldary)
    print("置換後のテキスト(tokenizer):", replaced_text_with_tokenizer)

if __name__ == "__main__":
    main()
