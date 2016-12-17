# ! encoding=utf8
import pydub
import re
import json
from django.shortcuts import render, redirect
from django.views.generic import View
from django.http import HttpResponse
from .models import Lesson
from .forms import LessonForm, AudioForm

class LessonsView(View):
    def get(self, request):
        lessons = Lesson.objects.all()
        context = {
            'lessons': lessons,
        }
        return render(request, 'main_game/lessons.html', context)

class LessonView(View):
    def get_extension(self, name):
        if not name:
            return None
        return name.rsplit('.', -1)[-1]

    def split_word(self, sentence, delimiter):
        sentence.strip()
        if ' ' in sentence:
            return sentence.split()
        return list(sentence)


    def get_sentence(self, lesson):
        trim_pattern = re.compile(ur'^[,.;，。：]+|[,.;，。：]+$', re.UNICODE)
        split_pattern = re.compile(ur'[,.;，。：]', re.UNICODE)

        plain_text = lesson.text
        plain_text = ''.join(plain_text.splitlines())
        plain_text = re.sub(trim_pattern, '', plain_text)
        sentences = re.split(split_pattern, plain_text)
        sentences = [self.split_word(sentence, lesson.delimiter)
            for sentence in sentences if sentence]
        return json.dumps(sentences)

    def get(self, request, lesson_id=None):
        lesson_id = lesson_id or 1
        lesson = Lesson.objects.get(id=lesson_id)
        context = {
            'lesson': lesson,
            'plain_text': self.get_sentence(lesson),
            'audio_extension': self.get_extension(lesson.audio.name),
            'english_audio_extension':
                self.get_extension(lesson.english_audio.name),
        }
        return render(request, 'main_game/lesson.html', context)

class EditView(View):
    def get(self, request, lesson_id=None):
        if lesson_id:
            lesson = Lesson.objects.get(id=lesson_id)
            form = LessonForm(instance=lesson)
        else:
            form = LessonForm()
        context = {
            'form': form,
            'lesson_id': lesson_id,
        }
        return render(request, 'main_game/edit.html', context)

    def post(self, request, lesson_id=None):
        if lesson_id:
            lesson = Lesson.objects.get(id=lesson_id)
            form = LessonForm(request.POST, request.FILES, instance=lesson)
        else:
            form = LessonForm(request.POST, request.FILES)
        if form.is_valid():
            lesson = form.save()
            return redirect('lesson', lesson.id)
        else:
            context = {
                'form': form,
            }
            return render(request, 'main_game/edit.html', context)

class UploadAudio(View):
    def post(self, request, lesson_id):
        lesson = Lesson.objects.get(id=lesson_id)
        form = AudioForm(request.POST, request.FILES, instance=lesson)
        if form.is_valid():
            lesson = form.save()
        if 'audio' in  request.FILES and request.FILES['audio']:
            sound = pydub.AudioSegment.from_wav(lesson.audio.path)
            sound.export(lesson.audio.path.replace('wav', 'mp3'), format="mp3")
            lesson.audio.name = lesson.audio.name.replace('wav', 'mp3')
        if 'english_audio' in  request.FILES and request.FILES['english_audio']:
            sound = pydub.AudioSegment.from_wav(lesson.english_audio.path)
            sound.export(lesson.english_audio.path.replace('wav', 'mp3'), format="mp3")
            lesson.english_audio.name = lesson.english_audio.name.replace('wav', 'mp3')
        lesson.save()

        context = {
            'form': form,
        }
        return HttpResponse('done')
